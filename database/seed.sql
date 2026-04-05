insert into users (user_type, name, email, password, phone_number)
values
('admin','System Admin', 'admin@ifrms.com' , '$2b$10$adminhash', '1234567890'),
('trainer', 'Rahul Trainer', 'trainer@ifrms.com', '$2b$10$trainerhash', '8888888888'),
('member', 'Arjun Member', 'member@ifrms.com', '$2b$10$memberhash', '7777777777');

INSERT INTO trainers (trainer_id, specialization)
VALUES (2, 'Cardio');

INSERT INTO members (member_id, membership_date)
VALUES (3, CURRENT_DATE);