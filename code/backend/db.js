import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

let pool;

// Pre-hashed password for the mock users ('password123')
const defaultPassword = bcrypt.hashSync('password123', 10);

// In-memory mock data for when DATABASE_URL is not provided
const mockData = {
  users: [
    { user_id: 1, user_type: 'admin', name: 'Admin User', email: 'admin@muscleup.com', password: defaultPassword, phone_number: '123-456-7890', dob: '1990-01-01', firebase_uid: null, avatar_url: null },
    { user_id: 2, user_type: 'trainer', name: 'Trainer User', email: 'trainer@muscleup.com', password: defaultPassword, phone_number: '123-456-7890', dob: '1990-01-01', firebase_uid: null, avatar_url: null },
    { user_id: 3, user_type: 'member', name: 'Member User', email: 'member@muscleup.com', password: defaultPassword, phone_number: '123-456-7890', dob: '1990-01-01', firebase_uid: null, avatar_url: null }
  ],
  members: [
    { member_id: 3, membership_date: '2024-01-01', membership_expiry_date: '2025-01-01', membership_plan: 'basic' }
  ],
  payments: [],
  notifications: [
    { notification_id: 1, user_id: 3, title: 'Welcome to MUSCLE UP!', message: 'Your membership is active. Start your fitness journey today!', is_read: false, created_at: new Date().toISOString() }
  ],
  trainers: [
    { trainer_id: 2, specialization: 'General Fitness' }
  ],
  equipment: [
    { equipment_id: 1, equipment_name: 'Treadmill', equipment_status: 'Available', managed_by: 1 },
    { equipment_id: 2, equipment_name: 'Rowing Machine', equipment_status: 'Maintenance', managed_by: 1 }
  ],
  schedules: [
    { schedule_id: 1, session_date: new Date().toISOString(), trainer_id: 2, member_id: 3 }
  ],
  reports: [
    { report_id: 1, report_type: 'Usage', generated_at: new Date().toISOString(), generated_by: 1 }
  ],
  fitness_programs: [
    { program_id: 1, program_name: 'Strength & Conditioning', capacity: 20 },
    { program_id: 2, program_name: 'HIIT Burn', capacity: 15 }
  ],
  enrollments: [
    { member_id: 3, program_id: 1 }
  ],
  workout_plans: [
    { workout_plan_id: 1, trainer_id: 2, member_id: 3, workout_description: '3x10 Squats, 3x10 Bench Press', created_at: new Date().toISOString() }
  ],
  fitness_progress: [
    { progress_id: 1, workout_plan_id: 1, weight: 75.5, reps: 10, workout_time: 45, progress_date: new Date().toISOString() }
  ]
};

export async function initDb() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'dummy') {
    const db = getDb();
    try {
      await db.query(`
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE equipment_status_type AS ENUM ('Available', 'In Use', 'Maintenance');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            user_type user_role NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255),
            phone_number VARCHAR(15),
            dob DATE,
            firebase_uid VARCHAR(128) UNIQUE,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS members (
            member_id INT PRIMARY KEY,
            membership_date DATE NOT NULL,
            membership_expiry_date DATE,
            membership_plan VARCHAR(20) DEFAULT 'basic',
            FOREIGN KEY (member_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            payment_id SERIAL PRIMARY KEY,
            member_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(20) DEFAULT 'pending',
            payment_method VARCHAR(50) DEFAULT 'card',
            stripe_payment_intent_id VARCHAR(255),
            membership_plan VARCHAR(20) NOT NULL,
            months INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notifications (
            notification_id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS trainers (
            trainer_id INT PRIMARY KEY,
            specialization VARCHAR(100) NOT NULL,
            FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fitness_programs (
            program_id SERIAL PRIMARY KEY,
            program_name VARCHAR(100) NOT NULL,
            capacity INT NOT NULL CHECK (capacity > 0)
        );

        CREATE TABLE IF NOT EXISTS enrollments (
            member_id INT,
            program_id INT,
            PRIMARY KEY (member_id, program_id),
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
            FOREIGN KEY (program_id) REFERENCES fitness_programs(program_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS workout_plans (
            workout_plan_id SERIAL PRIMARY KEY,
            workout_description TEXT NOT NULL,
            trainer_id INT NOT NULL,
            member_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE CASCADE,
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fitness_progress (
            progress_id SERIAL PRIMARY KEY,
            workout_plan_id INT NOT NULL,
            weight DECIMAL(5,2),
            reps INT,
            workout_time INT,
            progress_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(workout_plan_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS equipment (
            equipment_id SERIAL PRIMARY KEY,
            equipment_name VARCHAR(100) NOT NULL,
            equipment_status equipment_status_type DEFAULT 'Available',
            managed_by INT,
            FOREIGN KEY (managed_by) REFERENCES users(user_id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS schedules (
            schedule_id SERIAL PRIMARY KEY,
            session_date TIMESTAMP NOT NULL,
            trainer_id INT NOT NULL,
            member_id INT NOT NULL,
            FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE CASCADE,
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reports (
            report_id SERIAL PRIMARY KEY,
            generated_by INT NOT NULL,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            report_type VARCHAR(50) NOT NULL,
            FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE
        );

        DO $$ BEGIN
            ALTER TABLE schedules ADD CONSTRAINT unique_trainer_schedule UNIQUE (trainer_id, session_date);
        EXCEPTION
            WHEN duplicate_table_schema OR duplicate_object OR duplicate_alias OR invalid_table_definition OR duplicate_column OR 42710 THEN null;
        END $$;

        DO $$ BEGIN
            ALTER TABLE schedules ADD CONSTRAINT unique_member_schedule UNIQUE (member_id, session_date);
        EXCEPTION
            WHEN duplicate_table_schema OR duplicate_object OR duplicate_alias OR invalid_table_definition OR duplicate_column OR 42710 THEN null;
        END $$;

        CREATE OR REPLACE FUNCTION update_equipment_status()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            IF NEW.equipment_status IS NULL THEN
                NEW.equipment_status := 'Available';
            END IF;
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql;

        DO $$ BEGIN
            CREATE TRIGGER equipment_status_trigger
            BEFORE INSERT ON equipment
            FOR EACH ROW
            EXECUTE FUNCTION update_equipment_status();
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_workout_member ON workout_plans(member_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_trainer ON schedules(trainer_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_member ON schedules(member_id);
        CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(equipment_status);
      `);
      
      // Seed data if users table is empty
      const usersCheck = await db.query('SELECT count(*) FROM users');
      if (parseInt(usersCheck.rows[0].count) === 0) {
        console.log('Seeding database with initial data...');
        const bcrypt = await import('bcryptjs');
        const defaultPassword = bcrypt.default.hashSync('password123', 10);
        
        await db.query(`
          INSERT INTO users (user_type, name, email, password, phone_number, dob) VALUES 
          ('admin', 'Admin User', 'admin@muscleup.com', $1, '123-456-7890', '1990-01-01'),
          ('trainer', 'Trainer User', 'trainer@muscleup.com', $1, '123-456-7890', '1990-01-01'),
          ('member', 'Member User', 'member@muscleup.com', $1, '123-456-7890', '1990-01-01');
        `, [defaultPassword]);
        
        await db.query(`
          INSERT INTO members (member_id, membership_date, membership_expiry_date, membership_plan) VALUES 
          (3, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'basic');
        `);

        await db.query(`
          INSERT INTO trainers (trainer_id, specialization) VALUES 
          (2, 'General Fitness');
        `);

        await db.query(`
          INSERT INTO equipment (equipment_name, equipment_status, managed_by) VALUES 
          ('Treadmill', 'Available', 1),
          ('Rowing Machine', 'Maintenance', 1);
        `);
        
        await db.query(`
          INSERT INTO fitness_programs (program_name, capacity) VALUES 
          ('Strength & Conditioning', 20),
          ('HIIT Burn', 15);
        `);
        
        await db.query(`
          INSERT INTO schedules (session_date, trainer_id, member_id) VALUES 
          (CURRENT_TIMESTAMP + INTERVAL '1 day', 2, 3);
        `);
        
        await db.query(`
          INSERT INTO reports (report_type, generated_by) VALUES 
          ('Usage', 1);
        `);
        
        await db.query(`
          INSERT INTO workout_plans (trainer_id, member_id, workout_description) VALUES 
          (2, 3, '3x10 Squats, 3x10 Bench Press');
        `);
        
        await db.query(`
          INSERT INTO enrollments (member_id, program_id) VALUES 
          (3, 1);
        `);
        
        await db.query(`
          INSERT INTO fitness_progress (workout_plan_id, weight, reps, workout_time) VALUES 
          (1, 75.5, 10, 45);
        `);
        console.log('Database seeded successfully.');
      } else {
        console.log('Database tables initialized successfully.');
      }
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }
}

export function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'dummy';
    
    if (connectionString === 'dummy' || connectionString.includes('dummy')) {
      console.warn('DATABASE_URL is missing or dummy. Using in-memory mock database so the app can run.');
      
      const mockQuery = async (text, params = []) => {
        const query = text.toLowerCase();
        
        // Users
        if (query.includes('insert into users')) {
          // Firebase upsert: INSERT INTO users (user_type, name, email, phone_number, dob, firebase_uid, avatar_url)
          if (query.includes('firebase_uid')) {
            const newUser = {
              user_id: Date.now(), user_type: params[0], name: params[1], email: params[2],
              password: null, phone_number: params[3] || null, dob: params[4] || null,
              firebase_uid: params[5] || null, avatar_url: params[6] || null
            };
            mockData.users.push(newUser);
            return { rows: [newUser] };
          }
          // Classic register: INSERT INTO users (user_type, name, email, password, phone_number, dob)
          const newUser = { user_id: Date.now(), user_type: params[0], name: params[1], email: params[2], password: params[3], phone_number: params[4], dob: params[5], firebase_uid: null, avatar_url: null };
          mockData.users.push(newUser);
          return { rows: [newUser] };
        }
        if (query.includes('select * from users where firebase_uid')) {
          const user = mockData.users.find(u => u.firebase_uid === params[0]);
          return { rows: user ? [user] : [] };
        }
        if (query.includes('select * from users where email')) {
          const user = mockData.users.find(u => u.email === params[0]);
          return { rows: user ? [user] : [] };
        }
        if (query.includes('update users set firebase_uid')) {
          const user = mockData.users.find(u => u.user_id == params[2]);
          if (user) { user.firebase_uid = params[0]; user.avatar_url = user.avatar_url || params[1]; }
          return { rows: [] };
        }
        if (query.includes('select user_id as id') || query.includes('select * from users')) {
          if (query.includes("where user_type = 'trainer'")) {
            return { rows: mockData.users.filter(u => u.user_type === 'trainer').map(u => ({ id: u.user_id, name: u.name, email: u.email, role: u.user_type })) };
          }
          return { rows: mockData.users.map(u => ({ id: u.user_id, name: u.name, email: u.email, role: u.user_type })) };
        }
        if (query.includes('delete from users')) {
          mockData.users = mockData.users.filter(u => u.user_id != params[0]);
          return { rows: [] };
        }
        
        // Equipment
        if (query.includes('select * from equipment')) {
          return { rows: mockData.equipment };
        }
        if (query.includes('insert into equipment')) {
          const newEq = { equipment_id: Date.now(), equipment_name: params[0], equipment_status: params[1], managed_by: params[2] };
          mockData.equipment.push(newEq);
          return { rows: [newEq] };
        }
        if (query.includes('update equipment')) {
          // Warning: Brittle mock parsing. Assumes params[0] is status and params[1] is id.
          const eq = mockData.equipment.find(e => e.equipment_id == params[1]);
          if (eq) eq.equipment_status = params[0];
          return { rows: [] };
        }
        if (query.includes('delete from equipment')) {
          mockData.equipment = mockData.equipment.filter(e => e.equipment_id != params[0]);
          return { rows: [] };
        }
        
        // Schedules
        if (query.includes('insert into schedules')) {
          const newSched = { schedule_id: Date.now(), session_date: params[0], trainer_id: params[1], member_id: params[2] };
          mockData.schedules.push(newSched);
          return { rows: [{ schedule_id: newSched.schedule_id }] };
        }
        if (query.includes('update schedules set session_date')) {
          const s = mockData.schedules.find(s => s.schedule_id == params[1]);
          if (s) s.session_date = params[0];
          return { rows: [] };
        }
        if (query.includes('select * from schedules where schedule_id')) {
          const s = mockData.schedules.find(s => s.schedule_id == params[0]);
          return { rows: s ? [s] : [] };
        }
        if (query.includes('select s.schedule_id as id, s.session_date as date')) {
          if (query.includes('where s.schedule_id = $1')) {
            const s = mockData.schedules.find(s => s.schedule_id == params[0]);
            if (!s) return { rows: [] };
            return { rows: [{ id: s.schedule_id, date: s.session_date, trainer: 'Trainer User', member: 'Member User' }] };
          }
          return { rows: mockData.schedules.map(s => ({ id: s.schedule_id, date: s.session_date, trainer: 'Trainer User', member: 'Member User' })) };
        }
        
        // Reports
        if (query.includes('insert into reports')) {
          const newRep = { report_id: Date.now(), report_type: params[0], generated_by: params[1], generated_at: new Date().toISOString() };
          mockData.reports.push(newRep);
          return { rows: [newRep] };
        }
        if (query.includes('select report_id as id')) {
          return { rows: mockData.reports.map(r => ({ id: r.report_id, type: r.report_type, date: r.generated_at, title: `${r.report_type} Report` })) };
        }
        
        // Default fallback for other queries (like 'BEGIN', 'COMMIT', 'INSERT INTO members')
        
        // Programmes
        if (query.includes('insert into fitness_programs')) {
          const newProg = { program_id: Date.now(), program_name: params[0], capacity: params[1] };
          mockData.fitness_programs.push(newProg);
          return { rows: [newProg] };
        }
        if (query.includes('select * from fitness_programs')) {
          return { rows: mockData.fitness_programs };
        }
        if (query.includes('insert into enrollments')) {
          mockData.enrollments.push({ member_id: params[0], program_id: params[1] });
          return { rows: [] };
        }
        if (query.includes('select p.* from fitness_programs p join enrollments e')) {
          const enrolled = mockData.enrollments.filter(e => e.member_id == params[0]).map(e => e.program_id);
          return { rows: mockData.fitness_programs.filter(p => enrolled.includes(p.program_id)) };
        }

        // Workouts
        if (query.includes('select * from workout_plans where member_id')) {
          return { rows: mockData.workout_plans.filter(w => w.member_id == params[0]) };
        }
        if (query.includes('select * from workout_plans where trainer_id')) {
          return { rows: mockData.workout_plans.filter(w => w.trainer_id == params[0]) };
        }
        if (query.includes('insert into workout_plans')) {
          const newPlan = { workout_plan_id: Date.now(), trainer_id: params[0], member_id: params[1], workout_description: params[2], created_at: new Date().toISOString() };
          mockData.workout_plans.push(newPlan);
          return { rows: [newPlan] };
        }

        // Progress
        if (query.includes('select fp.* from fitness_progress fp join workout_plans wp')) {
          if (query.includes('where wp.member_id = $1')) {
             const planIds = mockData.workout_plans.filter(w => w.member_id == params[0]).map(w => w.workout_plan_id);
             return { rows: mockData.fitness_progress.filter(p => planIds.includes(p.workout_plan_id)).map(p => ({ ...p, recorded_at: p.progress_date || p.recorded_at })) };
          }
          if (query.includes('where wp.trainer_id = $1')) {
             const planIds = mockData.workout_plans.filter(w => w.trainer_id == params[0]).map(w => w.workout_plan_id);
             return { rows: mockData.fitness_progress.filter(p => planIds.includes(p.workout_plan_id)).map(p => ({ ...p, recorded_at: p.progress_date || p.recorded_at })) };
          }
        }
        if (query.includes('insert into fitness_progress')) {
          const ts = new Date().toISOString();
          const newProg = { progress_id: Date.now(), workout_plan_id: params[0], weight: params[1], reps: params[2], workout_time: params[3], progress_date: ts, recorded_at: ts };
          mockData.fitness_progress.push(newProg);
          return { rows: [newProg] };
        }

        // Profile update
        if (query.includes('update users set name')) {
          const user = mockData.users.find(u => u.user_id == params[4]);
          if (user) {
            user.name = params[0];
            user.email = params[1];
            user.phone_number = params[2];
            user.dob = params[3];
            return { rows: [user] };
          }
        }

        // Members - expiry and plan queries
        if (query.includes('select membership_expiry_date from members') || query.includes('select membership_date from members')) {
          const m = mockData.members.find(m => m.member_id == params[0]);
          return { rows: m ? [m] : [] };
        }
        if (query.includes('update members set membership_expiry_date')) {
          const m = mockData.members.find(m => m.member_id == params[2]);
          if (m) {
            m.membership_expiry_date = params[0];
            m.membership_plan = params[1];
          }
          return { rows: [] };
        }

        // Payments
        if (query.includes('insert into payments')) {
          const newPayment = {
            payment_id: Date.now(),
            member_id: params[0],
            amount: params[1],
            currency: params[2] || 'INR',
            status: params[3] || 'pending',
            // params[4] is membership_plan, params[5] is months, params[6] is stripe_payment_intent_id
            // when called from create-intent: [member_id, amount, currency, status, plan, months, intentId]
            membership_plan: params[4] || 'basic',
            months: params[5] || 1,
            stripe_payment_intent_id: params[6] || null,
            payment_method: 'card',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockData.payments.push(newPayment);
          return { rows: [newPayment] };
        }
        if (query.includes('update payments set status')) {
          // Called with [intentId, member_id] - find by intentId
          const intentId = params[0];
          const memberId = params[1];
          const p = mockData.payments.find(p => p.stripe_payment_intent_id == intentId && p.member_id == memberId);
          if (p) p.status = 'succeeded';
          return { rows: [] };
        }
        if (query.includes('select p.payment_id') || (query.includes('select * from payments') && query.includes('member_id'))) {
          const filtered = params[0]
            ? mockData.payments.filter(p => p.member_id == params[0])
            : mockData.payments;
          return {
            rows: filtered.map(p => {
              const member = mockData.users.find(u => u.user_id == p.member_id);
              return { ...p, id: p.payment_id, plan: p.membership_plan, member_name: member?.name || '—', member_email: member?.email || '—' };
            })
          };
        }
        if (query.includes('select * from payments') || query.includes('select payment_id as id')) {
          const filtered = params[0]
            ? mockData.payments.filter(p => p.member_id == params[0])
            : mockData.payments;
          // Add mock member info for admin view
          return {
            rows: filtered.map(p => {
              const member = mockData.users.find(u => u.user_id == p.member_id);
              return { ...p, id: p.payment_id, plan: p.membership_plan, member_name: member?.name || '—', member_email: member?.email || '—' };
            })
          };
        }

        // Notifications
        if (query.includes('insert into notifications')) {
          const newNotif = {
            notification_id: Date.now(),
            user_id: params[0],
            title: params[1],
            message: params[2],
            is_read: false,
            created_at: new Date().toISOString()
          };
          mockData.notifications.push(newNotif);
          return { rows: [newNotif] };
        }
        if (query.includes('select * from notifications') || query.includes('select notification_id')) {
          return { rows: mockData.notifications.filter(n => n.user_id == params[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
        }
        if (query.includes('update notifications set is_read')) {
          if (query.includes('notification_id = $1 and user_id = $2') || (params.length >= 2)) {
            // Called with [notification_id, user_id] - mark specific notification
            const n = mockData.notifications.find(n => n.notification_id == params[0] && n.user_id == params[1]);
            if (n) n.is_read = true;
          } else {
            // Called with [user_id] - mark all as read
            mockData.notifications.filter(n => n.user_id == params[0]).forEach(n => n.is_read = true);
          }
          return { rows: [] };
        }

        return { rows: [] };
      };

      return {
        query: mockQuery,
        connect: async () => ({
          query: mockQuery,
          release: () => {},
        })
      };
    }
    
    pool = new Pool({ connectionString });
  }
  return pool;
}
