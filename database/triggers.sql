CREATE OR REPLACE FUNCTION update_equipment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.equipment_status IS NULL THEN
        NEW.equipment_status := 'Available';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_status_trigger
BEFORE INSERT ON equipment
FOR EACH ROW
EXECUTE FUNCTION update_equipment_status();