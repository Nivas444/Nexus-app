import re
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.customer import Customer, CustomerContact, CustomerOfficeLocation


def is_indus_variant(name: Optional[str]) -> bool:
    if not name:
        return False
    clean = re.sub(r'[^a-zA-Z0-9]', '', str(name)).lower()
    # Matches 'industower', 'industowers', 'industowerltd', 'industowersltd', 'industowerlimited', etc.
    return clean.startswith('industower')

class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.customer_id == customer_id).first()

    def get_existing_indus(self, exclude_id: Optional[int] = None) -> Optional[Customer]:
        query = self.db.query(Customer)
        if exclude_id:
            query = query.filter(Customer.customer_id != exclude_id)
        records = query.all()
        for c in records:
            if is_indus_variant(c.customer_name) or is_indus_variant(c.legal_name):
                return c
        return None

    def get_by_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[Customer]:
        if not name or not name.strip():
            return None
        norm_name = " ".join(name.strip().split()).lower()
        alnum_name = re.sub(r'[^a-zA-Z0-9]', '', name).lower()

        query = self.db.query(Customer)
        if exclude_id:
            query = query.filter(Customer.customer_id != exclude_id)

        # 1. Exact case-insensitive / trimmed match
        direct = query.filter(func.lower(func.trim(Customer.customer_name)) == norm_name).first()
        if direct:
            return direct

        # 2. Normalized alphanumeric match
        records = query.all()
        for c in records:
            if c.customer_name:
                c_alnum = re.sub(r'[^a-zA-Z0-9]', '', c.customer_name).lower()
                if c_alnum == alnum_name:
                    return c
        return None

    def get_by_code(self, code: str, exclude_id: Optional[int] = None) -> Optional[Customer]:
        if not code or not code.strip():
            return None
        query = self.db.query(Customer).filter(func.lower(func.trim(Customer.customer_code)) == code.strip().lower())
        if exclude_id:
            query = query.filter(Customer.customer_id != exclude_id)
        return query.first()

    def get_by_legal_name(self, legal_name: str, exclude_id: Optional[int] = None) -> Optional[Customer]:
        if not legal_name or not legal_name.strip():
            return None
        norm_name = " ".join(legal_name.strip().split()).lower()
        alnum_name = re.sub(r'[^a-zA-Z0-9]', '', legal_name).lower()

        query = self.db.query(Customer)
        if exclude_id:
            query = query.filter(Customer.customer_id != exclude_id)

        # 1. Exact case-insensitive match
        direct = query.filter(func.lower(func.trim(Customer.legal_name)) == norm_name).first()
        if direct:
            return direct

        # 2. Normalized alphanumeric match
        records = query.all()
        for c in records:
            if c.legal_name:
                c_alnum = re.sub(r'[^a-zA-Z0-9]', '', c.legal_name).lower()
                if c_alnum == alnum_name:
                    return c
        return None

    def get_list(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        business_type: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "customer_id",
        sort_desc: bool = True
    ) -> Tuple[List[Customer], int]:
        query = self.db.query(Customer)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Customer.customer_name.ilike(search_pattern),
                    Customer.legal_name.ilike(search_pattern),
                    Customer.customer_code.ilike(search_pattern),
                    Customer.gst_number.ilike(search_pattern),
                    Customer.pan_number.ilike(search_pattern),
                    Customer.gst_address.ilike(search_pattern)
                )
            )

        if business_type:
            query = query.filter(Customer.business_type.ilike(business_type.strip()))

        if status:
            query = query.filter(Customer.status.ilike(status.strip()))

        total = query.count()

        sort_column = getattr(Customer, sort_by, Customer.customer_id)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer: Customer) -> bool:
        self.db.delete(customer)
        self.db.commit()
        return True

    # --- Contact details methods ---
    def get_contacts(self, customer_name: Optional[str] = None) -> List[CustomerContact]:
        query = self.db.query(CustomerContact)
        if customer_name and customer_name.strip():
            query = query.filter(CustomerContact.customer_name.ilike(customer_name.strip()))
        return query.order_by(desc(CustomerContact.contact_id)).all()

    def create_contact(self, contact: CustomerContact) -> CustomerContact:
        self.db.add(contact)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def delete_contact(self, contact_id: int) -> bool:
        c = self.db.query(CustomerContact).filter(CustomerContact.contact_id == contact_id).first()
        if c:
            self.db.delete(c)
            self.db.commit()
            return True
        return False

    # --- Location details methods ---
    def get_locations(self, customer_name: Optional[str] = None) -> List[CustomerOfficeLocation]:
        query = self.db.query(CustomerOfficeLocation)
        if customer_name and customer_name.strip():
            query = query.filter(CustomerOfficeLocation.customer_name.ilike(customer_name.strip()))
        return query.order_by(desc(CustomerOfficeLocation.office_id)).all()

    def create_location(self, loc: CustomerOfficeLocation) -> CustomerOfficeLocation:
        self.db.add(loc)
        self.db.commit()
        self.db.refresh(loc)
        return loc

    def delete_location(self, office_id: int) -> bool:
        loc = self.db.query(CustomerOfficeLocation).filter(CustomerOfficeLocation.office_id == office_id).first()
        if loc:
            self.db.delete(loc)
            self.db.commit()
            return True
        return False
