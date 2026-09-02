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

        # 4. Seed Sample BIS Standards
        sample_standards = [
            {
                "is_number": "IS 1363 : Part 1 : 2019",
                "title": "Hexagon Head Bolts, Screws and Nuts - Product Grade C - Part 1 Hexagon Head Bolts (Size Range M5 to M64)",
                "scope": "Specifies technical supply conditions, dimensions, tolerances, and mechanical property requirements for Grade C hexagon head bolts used in general structural engineering.",
                "domain": "Mechanical Engineering & Fasteners",
                "category": "Fasteners & Industrial Hardware",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2019, 4, 15),
                "certification_requirement": CertificationRequirement.MANDATORY,
                "keywords": ["bolts", "fasteners", "hexagon head", "steel", "grade c", "structural"],
                "issuing_committee": "PGD 31 Fasteners Committee",
                "ic_code": "PGD31"
            },
            {
                "is_number": "IS 2062 : 2011",
                "title": "Hot Rolled Medium and High Tensile Structural Steel - Specification",
                "scope": "Covers requirements for steel micro-alloyed with carbon, manganese, and structural elements intended for use in welded, bolted, and riveted structures.",
                "domain": "Civil & Metallurgical Engineering",
                "category": "Structural Steel & Metals",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2011, 8, 20),
                "certification_requirement": CertificationRequirement.MANDATORY,
                "keywords": ["structural steel", "hot rolled", "tensile strength", "beam", "plate", "construction"],
                "issuing_committee": "MTD 4 Wrought Steel Products",
                "ic_code": "MTD04"
            },
            {
                "is_number": "IS 694 : 2010",
                "title": "Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables for Working Voltages up to and including 1100 V",
                "scope": "Prescribes requirements for single core and multicore PVC insulated cables for electric power distribution, wiring, and industrial apparatus.",
                "domain": "Electrical & Electronics",
                "category": "Electrical Cables & Wiring",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2010, 11, 10),
                "certification_requirement": CertificationRequirement.REGULATED,
                "keywords": ["pvc cable", "copper conductor", "insulated wiring", "electrical safety", "1100v"],
                "issuing_committee": "ETD 9 Power Cables",
                "ic_code": "ETD09"
            },
            {
                "is_number": "IS 15652 : 2006",
                "title": "Insulating Mats for Electrical Purposes - Specification",
                "scope": "Covers high-voltage elastomeric insulating mats for electrical operations up to 33 kV substation applications protecting personnel against accidental shock.",
                "domain": "Safety & Electrical Infrastructure",
                "category": "Safety Equipment & Insulators",
                "status": StandardStatus.ACTIVE,
                "revision_date": date(2006, 6, 30),
                "certification_requirement": CertificationRequirement.MANDATORY,
                "keywords": ["insulating mat", "high voltage", "substation safety", "shock protection", "elastomeric"],
                "issuing_committee": "ETD 18 Industrial Electro-heating",
                "ic_code": "ETD18"
            }
        ]

        for std_data in sample_standards:
            std = Standard(**std_data)
            session.add(std)
            await session.flush()
            
            # Version
            ver = StandardVersion(
                standard_id=std.id,
                version_number="v4.0",
                publication_date=std.revision_date or date(2020, 1, 1),
                summary_of_changes="Aligned with international ISO specifications and updated quality parameters."
            )
            session.add(ver)

            # Amendment
            am = Amendment(
                standard_id=std.id,
                amendment_number=1,
                release_date=date(2022, 3, 15),
                title="Amendment No. 1 to IS Standard",
                description="Updated tolerance limits in clause 4.2."
            )
            session.add(am)

        await session.commit()
        print("✅ Seeded Sample BIS Standards, Versions, and Amendments.")
        print("🎉 Database Seeding Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
