import base64
from datetime import date
from decimal import Decimal
from app.db.session import ProjectSessionLocal, SessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectExpense, ProjectDocument
from app.models.indus_gbpa import IndusCustomerGbpa
from app.models.indus_site import IndusSiteDetails


def seed():
    proj_db = ProjectSessionLocal()
    master_db = SessionLocal()

    try:
        # 1. Ensure master DB has an extra OPEX GBPA item for rich testing
        existing_opx_maint = master_db.query(IndusCustomerGbpa).filter(IndusCustomerGbpa.item_code == "GBPA-SRV-MAINT").first()
        if not existing_opx_maint:
            master_db.add(IndusCustomerGbpa(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                item_code="GBPA-SRV-MAINT",
                item_name="Site Maintenance & Routine Inspection",
                item_description="Periodic site maintenance, battery check, and ground inspection",
                item_type="Opex",
                hsn_sac="SAC",
                hsn_sac_code="9954",
                uom="Visit",
                rate=Decimal("15000.00"),
                status="Active"
            ))
            master_db.commit()
            print("Added GBPA-SRV-MAINT to Master GBPA.")

        # Ensure Master DB indus_site_details contains site records for JMS sites
        site_in_123456 = master_db.query(IndusSiteDetails).filter(IndusSiteDetails.site_code == "IN-123456").first()
        if not site_in_123456:
            master_db.add(IndusSiteDetails(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                site_code="IN-123456",
                site_name="Guindy Hub",
                tower_type="Ground Based Tower (GBT)",
                district="Chennai",
                town="Guindy",
                address="Plot 14, Guindy Industrial Estate, Chennai - 600032",
                latitude=Decimal("13.0067000"),
                longitude=Decimal("80.2022000"),
                transport_zone="South Zone",
                fse_name="Rajesh Kumar",
                fse_contact_number="+91 9876543210",
                fse_email="rajesh.k@telecom.in",
                aom_name="Anand Sundaram",
                aom_contact_number="+91 9845012345",
                aom_email="anand.s@telecom.in",
                status="Active"
            ))
            master_db.commit()
            print("Added IN-123456 (Guindy Hub) to Master DB indus_site_details.")

        site_in_123457 = master_db.query(IndusSiteDetails).filter(IndusSiteDetails.site_code == "IN-123457").first()
        if not site_in_123457:
            master_db.add(IndusSiteDetails(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                site_code="IN-123457",
                site_name="Ambattur Central",
                tower_type="Rooftop Tower (RTT)",
                district="Chennai",
                town="Ambattur",
                address="Phase II, Ambattur Industrial Estate, Chennai - 600058",
                latitude=Decimal("13.1143000"),
                longitude=Decimal("80.1548000"),
                transport_zone="North Zone",
                fse_name="Suresh Raina",
                fse_contact_number="+91 9789012345",
                fse_email="suresh.r@telecom.in",
                aom_name="Karthik Raja",
                aom_contact_number="+91 9845987654",
                aom_email="karthik.r@telecom.in",
                status="Active"
            ))
            master_db.commit()
            print("Added IN-123457 (Ambattur Central) to Master DB indus_site_details.")

        # 2. Check and seed TelecomProject in Nexus_Project DB
        po_1 = "4500128934"
        site_1 = "IN-123456"

        proj1 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_1, TelecomProject.site_id == site_1).first()
        if not proj1:
            proj1 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_1,
                site_id=site_1,
                site_name="Guindy Hub",
                project_code="PRJ-2026-001",
                project_type="Run project",
                sub_project_type="Civil",
                po_type="Opex",
                po_amount=Decimal("245000.00"),
                current_task="JMS to be validate",
                project_status="JMS to be validate"
            )
            proj_db.add(proj1)
            proj_db.commit()
            print(f"Created TelecomProject {po_1} ({site_1})")
        else:
            proj1.current_task = "JMS to be validate"
            proj1.project_status = "JMS to be validate"
            proj_db.commit()

        po_2 = "4500128935"
        site_2 = "IN-123457"
        proj2 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_2, TelecomProject.site_id == site_2).first()
        if not proj2:
            proj2 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_2,
                site_id=site_2,
                site_name="Ambattur Central",
                project_code="PRJ-2026-002",
                project_type="New Build",
                sub_project_type="Electrical",
                po_type="Capex",
                po_amount=Decimal("380000.00"),
                current_task="JMS to be process",
                project_status="JMS to be process"
            )
            proj_db.add(proj2)
            proj_db.commit()
            print(f"Created TelecomProject {po_2} ({site_2})")
        else:
            proj2.current_task = "JMS to be process"
            proj2.project_status = "JMS to be process"
            proj_db.commit()

        # 3. Seed line items for po_1
        lines_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_1, TelecomIndusPo.site_id == site_1).count()
        if lines_count == 0:
            lines = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_1,
                    site_id=site_1,
                    line_number="10",
                    item_code="GBPA-OPT-FIB",
                    item_description="24-Core Armored Optical Fiber Cable",
                    uom="Mtr",
                    po_qty=Decimal("200.00"),
                    po_rate=Decimal("95.00"),
                    po_amount=Decimal("19000.00"),
                    po_total_amount=Decimal("19000.00"),
                    jms_qty=Decimal("250.00"),  # PO Difference = 50.00 (Discrepancy: JMS > PO)
                    jms_amount=Decimal("23750.00"),
                    net_material_qty=Decimal("200.00"),
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_1,
                    site_id=site_1,
                    line_number="20",
                    item_code="GBPA-SRV-MAINT",
                    item_description="Site Maintenance & Routine Inspection",
                    uom="Visit",
                    po_qty=Decimal("2.00"),
                    po_rate=Decimal("15000.00"),
                    po_amount=Decimal("30000.00"),
                    po_total_amount=Decimal("30000.00"),
                    jms_qty=Decimal("2.00"),
                    jms_amount=Decimal("30000.00"),
                    net_material_qty=Decimal("1.00"),  # Material Difference = 1.00 (Material shortage: JMS > Material)
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_1,
                    site_id=site_1,
                    line_number="30",
                    item_code="GBPA-CIV-FIX",
                    item_description="Civil Foundations & Ground Anchors Fixing",
                    uom="Set",
                    po_qty=Decimal("2.00"),
                    po_rate=Decimal("45000.00"),
                    po_amount=Decimal("90000.00"),
                    po_total_amount=Decimal("90000.00"),
                    jms_qty=Decimal("2.00"),
                    jms_amount=Decimal("90000.00"),
                    net_material_qty=Decimal("2.00"),
                    jms_status="Not Approved"
                )
            ]
            proj_db.add_all(lines)
            proj_db.commit()
            print(f"Added {len(lines)} line items for {po_1}")

        # Seed line items for po_2 (Capex)
        lines2_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_2, TelecomIndusPo.site_id == site_2).count()
        if lines2_count == 0:
            lines2 = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_2,
                    site_id=site_2,
                    line_number="10",
                    item_code="GBPA-SRV-INST",
                    item_description="Civil & Electrical Installation Service",
                    uom="Set",
                    po_qty=Decimal("2.00"),
                    po_rate=Decimal("125000.00"),
                    po_amount=Decimal("250000.00"),
                    po_total_amount=Decimal("250000.00"),
                    jms_qty=Decimal("2.00"),
                    jms_amount=Decimal("250000.00"),
                    net_material_qty=Decimal("2.00"),
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_2,
                    site_id=site_2,
                    line_number="20",
                    item_code="GBPA-GEN-15K",
                    item_description="15kVA Silent Diesel Generator",
                    uom="Nos",
                    po_qty=Decimal("1.00"),
                    po_rate=Decimal("130000.00"),
                    po_amount=Decimal("130000.00"),
                    po_total_amount=Decimal("130000.00"),
                    jms_qty=Decimal("1.00"),
                    jms_amount=Decimal("130000.00"),
                    net_material_qty=Decimal("1.00"),
                    jms_status="Not Approved"
                )
            ]
            proj_db.add_all(lines2)
            proj_db.commit()
            print(f"Added {len(lines2)} line items for {po_2}")

        # 4. Seed sample expenses for po_1
        exp_count = proj_db.query(ProjectExpense).filter(ProjectExpense.po_no == po_1).count()
        if exp_count == 0:
            exp1 = ProjectExpense(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_1,
                site_id=site_1,
                request_number="EXP-2026-001",
                request_by="Site Manager",
                request_date=date.today(),
                expense_head="Civil Works",
                expense_name="Concrete & Excavation Material",
                uom="M3",
                qty=Decimal("10.00"),
                rate=Decimal("4500.00"),
                amount=Decimal("45000.00"),
                total_amount=Decimal("45000.00"),
                transfer_to="ABC Builders"
            )
            exp2 = ProjectExpense(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_1,
                site_id=site_1,
                request_number="EXP-2026-002",
                request_by="Electrical Lead",
                request_date=date.today(),
                expense_head="Electrical",
                expense_name="Site Earthing & Distribution Cable",
                uom="Mtr",
                qty=Decimal("50.00"),
                rate=Decimal("800.00"),
                amount=Decimal("40000.00"),
                total_amount=Decimal("40000.00"),
                transfer_to="Power Electrics"
            )
            proj_db.add_all([exp1, exp2])
            proj_db.commit()
            print(f"Added 2 sample project expenses for {po_1}")

        # 5. Seed sample documents for po_1
        doc_count = proj_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_1).count()
        if doc_count == 0:
            sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
            b64_pdf = "data:application/pdf;base64," + base64.b64encode(sample_pdf_bytes).decode("utf-8")
            doc1 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_1,
                site_id=site_1,
                date=date.today(),
                document_name="STN_Signed_Copy.pdf",
                document_number="STN Document",
                document_details="Site Transfer Note Sign-off",
                documents=b64_pdf
            )
            doc2 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_1,
                site_id=site_1,
                date=date.today(),
                document_name="Commissioning_Report_Approved.pdf",
                document_number="Commissioning Report",
                document_details="Site Commissioning & Handover Report",
                documents=b64_pdf
            )
            proj_db.add_all([doc1, doc2])
            proj_db.commit()
            print(f"Added 2 sample documents for {po_1}")

        # -------------------------------------------------------------
        # 6. Add +3 Mock Data Records for Thorough Checking
        # -------------------------------------------------------------
        # Mock Record 3: Capex PO, New Build Civil, task 'JMS to be validate'
        po_3 = "4500128936"
        site_3 = "IN-123458"
        proj3 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_3, TelecomProject.site_id == site_3).first()
        if not proj3:
            proj3 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_3,
                site_id=site_3,
                site_name="Velachery Substation",
                project_code="PRJ-2026-003",
                project_type="New Build",
                sub_project_type="Civil",
                po_type="Capex",
                po_amount=Decimal("620000.00"),
                current_task="JMS to be validate",
                project_status="JMS to be validate"
            )
            proj_db.add(proj3)
            proj_db.commit()
            print(f"Created TelecomProject {po_3} ({site_3})")

        lines3_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_3, TelecomIndusPo.site_id == site_3).count()
        if lines3_count == 0:
            lines3 = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_3,
                    site_id=site_3,
                    line_number="10",
                    item_code="GBPA-SRV-INST",
                    item_description="Civil & Electrical Installation Service",
                    uom="Set",
                    po_qty=Decimal("2.00"),
                    po_rate=Decimal("125000.00"),
                    po_amount=Decimal("250000.00"),
                    po_total_amount=Decimal("250000.00"),
                    jms_qty=Decimal("2.00"),
                    jms_amount=Decimal("250000.00"),
                    net_material_qty=Decimal("2.00"),
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_3,
                    site_id=site_3,
                    line_number="20",
                    item_code="GBPA-GEN-15K",
                    item_description="15kVA Silent Diesel Generator",
                    uom="Nos",
                    po_qty=Decimal("1.00"),
                    po_rate=Decimal("280000.00"),
                    po_amount=Decimal("280000.00"),
                    po_total_amount=Decimal("280000.00"),
                    jms_qty=Decimal("1.00"),
                    jms_amount=Decimal("280000.00"),
                    net_material_qty=Decimal("1.00"),
                    jms_status="Not Approved"
                )
            ]
            proj_db.add_all(lines3)
            proj_db.commit()
            print(f"Added {len(lines3)} line items for {po_3}")

        exp3_count = proj_db.query(ProjectExpense).filter(ProjectExpense.po_no == po_3).count()
        if exp3_count == 0:
            exp3 = ProjectExpense(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_3,
                site_id=site_3,
                request_number="EXP-2026-003",
                request_by="Site Engineer",
                request_date=date.today(),
                expense_head="Civil Works",
                expense_name="Site Soil Testing & Topo Survey",
                uom="Job",
                qty=Decimal("1.00"),
                rate=Decimal("25000.00"),
                amount=Decimal("25000.00"),
                total_amount=Decimal("25000.00"),
                transfer_to="GeoTech Surveyors"
            )
            proj_db.add(exp3)
            proj_db.commit()

        doc3_count = proj_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_3).count()
        if doc3_count == 0:
            sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
            b64_pdf = "data:application/pdf;base64," + base64.b64encode(sample_pdf_bytes).decode("utf-8")
            doc3 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_3,
                site_id=site_3,
                date=date.today(),
                document_name="Survey_Report_Velachery.pdf",
                document_number="Survey report",
                document_details="Site survey and leveling sign-off",
                documents=b64_pdf
            )
            proj_db.add(doc3)
            proj_db.commit()

        # Mock Record 4: Opex PO, Run Project Electrical, with negative and positive PO differences
        po_4 = "4500128937"
        site_4 = "IN-123459"
        proj4 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_4, TelecomProject.site_id == site_4).first()
        if not proj4:
            proj4 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_4,
                site_id=site_4,
                site_name="T Nagar Central",
                project_code="PRJ-2026-004",
                project_type="Run project",
                sub_project_type="Electrical",
                po_type="Opex",
                po_amount=Decimal("175000.00"),
                current_task="JMS to be validate",
                project_status="JMS to be validate"
            )
            proj_db.add(proj4)
            proj_db.commit()
            print(f"Created TelecomProject {po_4} ({site_4})")

        lines4_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_4, TelecomIndusPo.site_id == site_4).count()
        if lines4_count == 0:
            lines4 = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_4,
                    site_id=site_4,
                    line_number="10",
                    item_code="GBPA-OPT-FIB",
                    item_description="24-Core Armored Optical Fiber Cable",
                    uom="Mtr",
                    po_qty=Decimal("500.00"),
                    po_rate=Decimal("95.00"),
                    po_amount=Decimal("47500.00"),
                    po_total_amount=Decimal("47500.00"),
                    jms_qty=Decimal("600.00"),  # PO Difference = 500 - 600 = -100 (Negative Difference highlighted red)
                    jms_amount=Decimal("57000.00"),
                    net_material_qty=Decimal("500.00"),
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_4,
                    site_id=site_4,
                    line_number="20",
                    item_code="GBPA-SRV-MAINT",
                    item_description="Site Maintenance & Routine Inspection",
                    uom="Visit",
                    po_qty=Decimal("4.00"),
                    po_rate=Decimal("15000.00"),
                    po_amount=Decimal("60000.00"),
                    po_total_amount=Decimal("60000.00"),
                    jms_qty=Decimal("3.00"),  # PO Difference = 4 - 3 = +1 (Positive Difference visible in PO Filter)
                    jms_amount=Decimal("45000.00"),
                    net_material_qty=Decimal("4.00"),
                    jms_status="Not Approved"
                )
            ]
            proj_db.add_all(lines4)
            proj_db.commit()
            print(f"Added {len(lines4)} line items for {po_4}")

        exp4_count = proj_db.query(ProjectExpense).filter(ProjectExpense.po_no == po_4).count()
        if exp4_count == 0:
            exp4 = ProjectExpense(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_4,
                site_id=site_4,
                request_number="EXP-2026-004",
                request_by="Fiber Lead",
                request_date=date.today(),
                expense_head="Optical Works",
                expense_name="Fiber Splicing & Testing",
                uom="Km",
                qty=Decimal("2.00"),
                rate=Decimal("7000.00"),
                amount=Decimal("14000.00"),
                total_amount=Decimal("14000.00"),
                transfer_to="Metro Fiber Comm"
            )
            proj_db.add(exp4)
            proj_db.commit()

        doc4_count = proj_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_4).count()
        if doc4_count == 0:
            sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
            b64_pdf = "data:application/pdf;base64," + base64.b64encode(sample_pdf_bytes).decode("utf-8")
            doc4 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_4,
                site_id=site_4,
                date=date.today(),
                document_name="Mail_Approval_TNagar.pdf",
                document_number="Mail Approval",
                document_details="Customer email approval for fiber extension",
                documents=b64_pdf
            )
            proj_db.add(doc4)
            proj_db.commit()

        # Mock Record 5: Capex PO, New Build Civil, task 'JMS approval pending'
        # Moved to Project Manager -> Disappears from Commercial login, visible in PM login
        po_5 = "4500128938"
        site_5 = "IN-123460"
        proj5 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_5, TelecomProject.site_id == site_5).first()
        if not proj5:
            proj5 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_5,
                site_id=site_5,
                site_name="Porur Gateway",
                project_code="PRJ-2026-005",
                project_type="New Build",
                sub_project_type="Civil",
                po_type="Capex",
                po_amount=Decimal("495000.00"),
                current_task="JMS approval pending",
                project_status="JMS Approval Pending"
            )
            proj_db.add(proj5)
            proj_db.commit()
            print(f"Created TelecomProject {po_5} ({site_5})")

        lines5_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_5, TelecomIndusPo.site_id == site_5).count()
        if lines5_count == 0:
            lines5 = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_5,
                    site_id=site_5,
                    line_number="10",
                    item_code="GBPA-TWR-40M",
                    item_description="40m Ground Based Tower Supply & Erection",
                    uom="Nos",
                    po_qty=Decimal("1.00"),
                    po_rate=Decimal("495000.00"),
                    po_amount=Decimal("495000.00"),
                    po_total_amount=Decimal("495000.00"),
                    jms_qty=Decimal("1.00"),
                    jms_amount=Decimal("495000.00"),
                    net_material_qty=Decimal("1.00"),
                    jms_status="Approved"
                )
            ]
            proj_db.add_all(lines5)
            proj_db.commit()
            print(f"Added {len(lines5)} line items for {po_5}")

        doc5_count = proj_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_5).count()
        if doc5_count == 0:
            sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
            b64_pdf = "data:application/pdf;base64," + base64.b64encode(sample_pdf_bytes).decode("utf-8")
            doc5 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_5,
                site_id=site_5,
                date=date.today(),
                document_name="Audit_Certificate_Porur.pdf",
                document_number="Audit Certificate",
                document_details="Quality audit certificate approved",
                documents=b64_pdf
            )
            proj_db.add(doc5)
            proj_db.commit()

        # Mock Record 6: Opex PO, Run Project Civil, task 'JMS to be validate' (Salem South)
        po_6 = "4500128939"
        site_6 = "IN-123461"
        proj6 = proj_db.query(TelecomProject).filter(TelecomProject.po_no == po_6, TelecomProject.site_id == site_6).first()
        if not proj6:
            proj6 = TelecomProject(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_6,
                site_id=site_6,
                site_name="Salem South",
                project_code="PRJ-2026-006",
                project_type="Run project",
                sub_project_type="Civil",
                po_type="Opex",
                po_amount=Decimal("275000.00"),
                current_task="JMS to be validate",
                project_status="JMS to be validate"
            )
            proj_db.add(proj6)
            proj_db.commit()
            print(f"Created TelecomProject {po_6} ({site_6})")
        else:
            proj6.current_task = "JMS to be validate"
            proj6.project_status = "JMS to be validate"
            proj_db.commit()

        lines6_count = proj_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_6, TelecomIndusPo.site_id == site_6).count()
        if lines6_count == 0:
            lines6 = [
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_6,
                    site_id=site_6,
                    line_number="10",
                    item_code="GBPA-OPT-FIB",
                    item_description="24-Core Armored Optical Fiber Cable",
                    uom="Mtr",
                    po_qty=Decimal("300.00"),
                    po_rate=Decimal("95.00"),
                    po_amount=Decimal("28500.00"),
                    po_total_amount=Decimal("28500.00"),
                    jms_qty=Decimal("300.00"),
                    jms_amount=Decimal("28500.00"),
                    net_material_qty=Decimal("300.00"),
                    jms_status="Not Approved"
                ),
                TelecomIndusPo(
                    company_name="Nexus",
                    customer_name="Indus Towers Ltd",
                    po_no=po_6,
                    site_id=site_6,
                    line_number="20",
                    item_code="GBPA-SRV-MAINT",
                    item_description="Site Maintenance & Routine Inspection",
                    uom="Visit",
                    po_qty=Decimal("2.00"),
                    po_rate=Decimal("15000.00"),
                    po_amount=Decimal("30000.00"),
                    po_total_amount=Decimal("30000.00"),
                    jms_qty=Decimal("2.00"),
                    jms_amount=Decimal("30000.00"),
                    net_material_qty=Decimal("2.00"),
                    jms_status="Not Approved"
                )
            ]
            proj_db.add_all(lines6)
            proj_db.commit()
            print(f"Added {len(lines6)} line items for {po_6}")

        exp6_count = proj_db.query(ProjectExpense).filter(ProjectExpense.po_no == po_6).count()
        if exp6_count == 0:
            exp6 = ProjectExpense(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_6,
                site_id=site_6,
                request_number="EXP-2026-006",
                request_by="Civil Lead",
                request_date=date.today(),
                expense_head="Civil Works",
                expense_name="Site Clearing & Earthwork",
                uom="Job",
                qty=Decimal("1.00"),
                rate=Decimal("15000.00"),
                amount=Decimal("15000.00"),
                total_amount=Decimal("15000.00"),
                transfer_to="Salem Earthworks"
            )
            proj_db.add(exp6)
            proj_db.commit()

        doc6_count = proj_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_6).count()
        if doc6_count == 0:
            sample_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
            b64_pdf = "data:application/pdf;base64," + base64.b64encode(sample_pdf_bytes).decode("utf-8")
            doc6 = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_6,
                site_id=site_6,
                date=date.today(),
                document_name="Survey_Report_Salem.pdf",
                document_number="Survey report",
                document_details="Initial site survey sign-off",
                documents=b64_pdf
            )
            proj_db.add(doc6)
            proj_db.commit()

        print("JMS data seeding completed successfully.")

    finally:
        proj_db.close()
        master_db.close()


if __name__ == "__main__":
    seed()
