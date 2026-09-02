import asyncio
import sys
import os
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine, Base
import app.models
from app.core.security import get_password_hash
from app.models.auth import Role, Permission, Organization, User
from app.models.standards import Standard, StandardStatus, CertificationRequirement, StandardVersion, Amendment


async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("🌱 Starting database seeding...")
        
        # 1. Seed Roles
        roles = {
            "SUPER_ADMIN": "Full System Administrator access across all tenant organizations",
            "ORG_ADMIN": "Organization Administrator with full internal procurement control",
            "PROCUREMENT_OFFICER": "Procurement Officer responsible for tender analysis and standards mapping",
            "APPROVER": "Executive Approver for compliance reports and tender sign-offs",
            "AUDITOR": "Read-only Auditor access for compliance reporting and audit verification"
        }
        
        role_objs = {}
        for r_name, r_desc in roles.items():
            role = Role(name=r_name, description=r_desc)
            session.add(role)
            role_objs[r_name] = role
        await session.flush()
        print("✅ Seeded Roles.")

        # 2. Seed Default Organization
        org = Organization(
            name="Ministry of Housing and Urban Affairs (MoHUA)",
            code="mohua-gov-in",
            domain="mohua.gov.in",
            contact_email="procurement@mohua.gov.in",
            address="Nirman Bhawan, New Delhi"
        )
        session.add(org)
        await session.flush()
        print("✅ Seeded Default Organization.")

        # 3. Seed Default Admin User
        admin_user = User(
            email="admin@mohua.gov.in",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Rajesh Kumar",
            designation="Chief Procurement Officer",
            organization_id=org.id,
            roles=[role_objs["SUPER_ADMIN"], role_objs["ORG_ADMIN"]]
        )
        session.add(admin_user)
        print("✅ Seeded Admin User (admin@mohua.gov.in / Admin123!).")

        # 4. Seed Sample & CRS Mandatory BIS Standards
        sample_standards = [
            {
                "is_number": "IS 13252(Part 1):2010",
                "title": "Information Technology Equipment - Safety - Part 1: General Requirements",
                "scope": "Mandatory safety specification for Automatic Data Processing Machines, Laptops, Notebooks, Tablets, Mobile Phones, Printers, Scanners, POS Terminals, Power Adaptors, and Hard Disk Drives under BIS CRS.",
                "domain": "Electronics & Information Technology",
                "category": "Computers, Laptops, Mobile Phones & IT Peripherals",
                "sector": "computers",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2010, 4, 1),
                "certification_requirement": CertificationRequirement.CRS,
                "is_crs_mandated": True,
                "is_revised": False,
                "keywords": ["laptops", "notebooks", "tablets", "computers", "it equipment", "mobile phones", "safety"],
                "issuing_committee": "LITD 14 Information Technology Equipment Safety",
                "ic_code": "LITD14"
            },
            {
                "is_number": "IS 616:2017",
                "title": "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
                "scope": "Mandatory safety requirements for Amplifiers, Televisions, Bluetooth Speakers, Smart Speakers, Wireless Headphones, Video Games, and Power Adaptors under BIS CRS.",
                "domain": "Electronics & Information Technology",
                "category": "Audio, Video & Consumer Electronics",
                "sector": "electronics",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2017, 9, 15),
                "certification_requirement": CertificationRequirement.CRS,
                "is_crs_mandated": True,
                "is_revised": False,
                "keywords": ["television", "audio", "video", "speakers", "headphones", "electronics", "safety"],
                "issuing_committee": "LITD 07 Audio, Video and Similar Electronic Apparatus",
                "ic_code": "LITD07"
            },
            {
                "is_number": "IS 16333 (Part 3) : 2022",
                "title": "Mobile Phone Handsets - Part 3: Indian Language Support for Mobile Phone Handsets - Specific Requirements",
                "scope": "Prescribes requirements for display of Indian languages, text entry, and readability compliance in mobile phones sold in India.",
                "domain": "Electronics & Information Technology",
                "category": "Mobile Phones & Telecom Equipment",
                "sector": "phones",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2022, 5, 1),
                "certification_requirement": CertificationRequirement.CRS,
                "is_crs_mandated": True,
                "is_revised": False,
                "keywords": ["mobile phones", "smartphones", "indian language support", "unicode", "telecom"],
                "issuing_committee": "LITD 16 Mobile Electronics & Language Support",
                "ic_code": "LITD16"
            },
            {
                "is_number": "IS 16046(Part 2): 2018",
                "title": "Sealed Secondary Cells/Batteries Containing Alkaline or Other Non-Acid Electrolytes - Part 2 Lithium Systems",
                "scope": "Mandatory safety parameters for rechargeable Lithium-Ion and Lithium Polymer batteries used in mobile phones, laptops, and portable electronic devices.",
                "domain": "Electrotechnical & Power Sources",
                "category": "Batteries & Power Sources",
                "sector": "batteries_chargers",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2018, 6, 1),
                "certification_requirement": CertificationRequirement.CRS,
                "is_crs_mandated": True,
                "is_revised": False,
                "keywords": ["battery", "lithium ion", "power bank", "portable power", "secondary cells"],
                "issuing_committee": "ETD 11 Secondary Cells and Batteries Committee",
                "ic_code": "ETD11"
            },
            {
                "is_number": "IS 18112:2025",
                "title": "Specification for Television Sets - Digital Satellite and Cable Tuner Compatibility",
                "scope": "Mandatory specification for digital satellite, cable TV reception, and built-in tuner requirements in Smart TV sets.",
                "domain": "Electronics & Telecom Equipment",
                "category": "Television & Telecom Apparatus",
                "sector": "telecom",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2025, 1, 1),
                "certification_requirement": CertificationRequirement.CRS,
                "is_crs_mandated": True,
                "is_revised": False,
                "keywords": ["television", "smart tv", "tuner", "telecom", "set top box"],
                "issuing_committee": "LITD 06 Audio, Video and Multimedia Systems",
                "ic_code": "LITD06"
            }
        ]

        for std_data in sample_standards:
            std = Standard(**std_data)
            session.add(std)
            await session.flush()
            
            # Version
            ver = StandardVersion(
                standard_id=std.id,
                version_number="v1.0",
                publication_date=std.revision_date or date(2020, 1, 1),
                summary_of_changes="Latest mandatory revision under BIS Compulsory Registration Scheme."
            )
            session.add(ver)

            # Amendment
            am = Amendment(
                standard_id=std.id,
                amendment_number=1,
                release_date=date(2023, 1, 1),
                title="Amendment No. 1 to IS Standard",
                description="Updated safety limits and language support guidelines."
            )
            session.add(am)

        await session.commit()
        print("✅ Seeded Sample & CRS Mandatory BIS Standards, Versions, and Amendments.")
        print("🎉 Database Seeding Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
