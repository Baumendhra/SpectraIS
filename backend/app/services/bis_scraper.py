import asyncio
import os
import re
import logging
from datetime import date, datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "html_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# BIS CRS Products live URL
CRS_PRODUCTS_URL = "https://www.crsbis.in/BIS/products-bis.do"
ROBOTS_TXT_URL = "https://www.crsbis.in/robots.txt"

# Committee & Sector mappings
COMMITTEE_MAPPING = {
    "13252": ("LITD 14 Information Technology Equipment Safety", "LITD14"),
    "616": ("LITD 07 Audio, Video and Similar Electronic Apparatus", "LITD07"),
    "16046": ("ETD 11 Secondary Cells and Batteries Committee", "ETD11"),
    "16333": ("LITD 16 Mobile Electronics & Language Support", "LITD16"),
    "16242": ("ETD 12 Power Electronics & UPS Systems", "ETD12"),
    "18112": ("LITD 06 Audio, Video and Multimedia Systems", "LITD06"),
    "62368": ("LITD 14 Information & Communication Technology Equipment", "LITD14"),
    "14286": ("ETD 28 Solar Photovoltaic Energy Systems", "ETD28"),
    "16102": ("ETD 23 Electric Lamps and Lighting Equipment", "ETD23"),
    "302": ("ETD 32 Electrical Appliances Committee", "ETD32"),
}

SECTOR_KEYWORDS = {
    "laptops": ["laptop", "notebook", "tablet", "portable computer"],
    "computers": ["automatic data processing", "laptop", "notebook", "tablet", "desktop", "keyboard", "hard disk", "smps", "printer", "scanner", "display", "monitor", "cash register", "pos", "passport reader"],
    "phones": ["mobile phone", "cellular", "handset", "language support for mobile"],
    "telecom": ["telephone", "set top box", "cctv", "wireless microphone", "telecommunication", "router", "answering machine"],
    "electronics": ["amplifier", "video", "television", "tv", "camera", "webcam", "speaker", "led", "smart watch", "xr", "augmented reality", "virtual reality"],
    "batteries_chargers": ["power bank", "battery", "cells", "adaptor", "adapter", "power supply", "ups", "inverter", "charger"],
    "peripherals": ["keyboard", "mouse", "barcode", "iris scanner", "fingerprint", "smart card", "pos", "hard disk", "solid-state"]
}


class BISWebScraper:
    def __init__(self, delay_seconds: float = 1.0):
        self.delay_seconds = delay_seconds
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

    async def fetch_url(self, url: str, cache_filename: str) -> str:
        """Fetches raw HTML from remote URL with local disk caching and rate-limiting delay."""
        cache_filepath = os.path.join(CACHE_DIR, cache_filename)
        if os.path.exists(cache_filepath):
            logger.info(f"Loading cached HTML from {cache_filepath}")
            with open(cache_filepath, "r", encoding="utf-8") as f:
                return f.read()

        logger.info(f"Respecting rate-limit delay ({self.delay_seconds}s) before requesting {url}")
        await asyncio.sleep(self.delay_seconds)

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            content = response.text

        with open(cache_filepath, "w", encoding="utf-8") as f:
            f.write(content)
            logger.info(f"Saved response HTML to cache {cache_filepath}")

        return content

    def derive_sectors(self, product_name: str, is_number: str) -> List[str]:
        """Classifies product & standard into computer, electronics, laptops, phones, telecom, etc."""
        text = f"{product_name} {is_number}".lower()
        matched = []
        for sector, keywords in SECTOR_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                matched.append(sector)
        if not matched:
            matched.append("electronics")
        return matched

    def derive_committee(self, is_number: str) -> tuple[str, str]:
        """Derives governing sectional committee details based on IS number code."""
        for num_part, committee in COMMITTEE_MAPPING.items():
            if num_part in is_number:
                return committee
        return ("LITD 14 Electronics and Information Technology", "LITD14")

    async def scrape_crs_mandatory_standards(self) -> List[Dict[str, Any]]:
        """Scrapes live mandatory product standards from the BIS CRS portal."""
        html = await self.fetch_url(CRS_PRODUCTS_URL, "crs_products.html")
        soup = BeautifulSoup(html, "html.parser")
        
        extracted_standards = []
        table = soup.find("table")
        if not table:
            logger.warning("No standard table found in CRS HTML; returning empty.")
            return extracted_standards

        rows = table.find_all("tr")[1:]  # skip header
        for row in rows:
            cols = [col.text.strip() for col in row.find_all("td")]
            if len(cols) < 3:
                continue

            # Handling row layout variations
            sl_no = cols[0]
            if not sl_no.isdigit() and len(cols) >= 4:
                product_name = cols[0]
                is_num = cols[1]
                implementation_date_str = cols[2] if len(cols) > 2 else ""
            else:
                product_name = cols[1]
                is_num = cols[2]
                implementation_date_str = cols[3] if len(cols) > 3 else ""

            # Clean and normalize IS number
            is_num_clean = re.sub(r'\s+', ' ', is_num).strip()
            if not is_num_clean or "IS" not in is_num_clean.upper():
                continue

            committee_name, ic_code = self.derive_committee(is_num_clean)
            sectors = self.derive_sectors(product_name, is_num_clean)

            # Determine revision status
            is_revised = False
            superseded_by = None
            status_enum = "ACTIVE"
            if "OR" in is_num_clean or "2025" in is_num_clean or "2023" in is_num_clean:
                if "18112" in is_num_clean:
                    superseded_by = "IS 18112:2025"
                elif "62368" in is_num_clean:
                    superseded_by = "IS/IEC 62368: Part 1: 2023"

            extracted_standards.append({
                "is_number": is_num_clean,
                "title": f"Mandatory Safety Specification for {product_name.title()}",
                "scope": f"Prescribes mandatory safety parameters, electrical shock prevention, fire safety, and quality requirements under BIS Compulsory Registration Scheme for {product_name}.",
                "domain": "Electronics & Information Technology",
                "category": product_name.title(),
                "sector": sectors[0] if sectors else "electronics",
                "status": status_enum,
                "certification_requirement": "CRS",
                "is_crs_mandated": True,
                "is_revised": is_revised,
                "superseded_by": superseded_by,
                "issuing_committee": committee_name,
                "ic_code": ic_code,
                "keywords": [sector for sector in sectors] + [product_name.lower(), is_num_clean.lower()],
                "last_scraped_at": date.today()
            })

        logger.info(f"Successfully scraped {len(extracted_standards)} mandatory BIS standards.")
        return extracted_standards
