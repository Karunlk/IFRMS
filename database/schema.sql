CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
CREATE TYPE equipment_status_type AS ENUM ('Available', 'In Use', 'Maintenance');
CREATE TYPE membership_plan_type AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE payment_status_type AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_type user_role NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    member_id INT PRIMARY KEY,
    membership_date DATE NOT NULL,
    membership_expiry_date DATE,
    membership_plan membership_plan_type DEFAULT 'basic',
    FOREIGN KEY (member_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status payment_status_type DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'card',
    stripe_payment_intent_id VARCHAR(255),
    membership_plan membership_plan_type NOT NULL,
    months INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE trainers (
    trainer_id INT PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE fitness_programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0)
);

CREATE TABLE enrollments (
    member_id INT,
    program_id INT,
    PRIMARY KEY (member_id, program_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES fitness_programs(program_id) ON DELETE CASCADE
);

CREATE TABLE workout_plans (
    workout_plan_id SERIAL PRIMARY KEY,
    workout_description TEXT NOT NULL,
    trainer_id INT NOT NULL,
    member_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE TABLE fitness_progress (
    progress_id SERIAL PRIMARY KEY,
    workout_plan_id INT NOT NULL,
    weight DECIMAL(5,2),
    reps INT,
    workout_time INT,
    progress_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(workout_plan_id) ON DELETE CASCADE
);

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_status equipment_status_type DEFAULT 'Available',
    managed_by INT,
    FOREIGN KEY (managed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    session_date TIMESTAMP NOT NULL,
    trainer_id INT NOT NULL,
    member_id INT NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE
);
