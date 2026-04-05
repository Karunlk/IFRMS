ALTER TABLE schedules
ADD CONSTRAINT unique_trainer_schedule
UNIQUE (trainer_id, session_date);

ALTER TABLE schedules
ADD CONSTRAINT unique_member_schedule
UNIQUE (member_id, session_date);