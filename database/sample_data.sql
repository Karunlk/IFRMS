INSERT INTO fitness_programs (program_name, capacity)
VALUES
('Weight Loss Program', 50),
('Muscle Building Program', 40),
('Yoga Program', 30);

INSERT INTO enrollments (member_id, program_id)
VALUES (3, 1);

INSERT INTO workout_plans (workout_description, trainer_id, member_id)
VALUES
('Pushups, Squats, Running - 45 minutes', 2, 3);

INSERT INTO fitness_progress (workout_plan_id, weight, reps, workout_time)
VALUES
(1, 70.5, 20, 45);

INSERT INTO equipment (equipment_name, equipment_status, managed_by)
VALUES
('Treadmill', 'Available', 1),
('Bench Press', 'In Use', 1);

INSERT INTO schedules (session_date, trainer_id, member_id)
VALUES
('2026-03-30 10:00:00', 2, 3);

INSERT INTO reports (generated_by, report_type)
VALUES
(1, 'Equipment Usage');