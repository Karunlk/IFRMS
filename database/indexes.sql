create index idx_user_email on users(email);
create index idx_workout_member on workout_plans(member_id);
create index idx_schedules_trainer on schedules(trainer_id);
create index idx_schedules_member on schedules(member_id);
create index idx_equipment_status on equipment(equipment_status);