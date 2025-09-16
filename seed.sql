USE hmis;
INSERT INTO users (name,email,password_hash,role) VALUES
('Admin','admin@hmis.local','$2b$10$hYvG5f0NQmA2Xv0E0vY6AuwbJxJ7o5GJQb1dV8mUo4s0gqz7xw9nK','admin');
INSERT INTO patients (patient_uid,name,dob,gender,phone,address) VALUES
('P-0001','Ravi Kumar','1995-01-10','M','9000000001','Jaipur'),
('P-0002','Neha Sharma','1998-07-22','F','9000000002','Bhopal');
USE hmis;
INSERT INTO users (name,email,password_hash,role)
VALUES ('Dr. Meera','meera@hmis.local',
        '$2b$10$hYvG5f0NQmA2Xv0E0vY6AuwbJxJ7o5GJQb1dV8mUo4s0gqz7xw9nK',
        'doctor');
