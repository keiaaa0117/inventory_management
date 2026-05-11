-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_info VARCHAR(255),
    memo TEXT,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_name VARCHAR(255) NOT NULL,
    customer_id UUID NOT NULL,
    memo TEXT,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    construction_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create order custom fields table
CREATE TABLE IF NOT EXISTS order_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order custom field values table
CREATE TABLE IF NOT EXISTS order_custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    field_id UUID NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_custom_field_values_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_custom_field_values_field FOREIGN KEY (field_id) REFERENCES order_custom_fields(id),
    CONSTRAINT uk_order_custom_field_values_order_field UNIQUE (order_id, field_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_construction_date ON orders(construction_date);
CREATE INDEX IF NOT EXISTS idx_orders_deleted ON orders(deleted);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted);
CREATE INDEX IF NOT EXISTS idx_order_custom_fields_deleted ON order_custom_fields(deleted);
CREATE INDEX IF NOT EXISTS idx_order_custom_field_values_order_id ON order_custom_field_values(order_id);
CREATE INDEX IF NOT EXISTS idx_order_custom_field_values_field_id ON order_custom_field_values(field_id);

-- Create or replace function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_custom_fields_updated_at ON order_custom_fields;
CREATE TRIGGER update_order_custom_fields_updated_at
    BEFORE UPDATE ON order_custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_custom_field_values_updated_at ON order_custom_field_values;
CREATE TRIGGER update_order_custom_field_values_updated_at
    BEFORE UPDATE ON order_custom_field_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
