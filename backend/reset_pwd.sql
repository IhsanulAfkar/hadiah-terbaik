-- Reset passwords for all users to 'password123'
-- Hash: $2a$10$FStH/qUT4ZxZCOgJQ1mVzepMFUjMPiqwiDRqHQ1ItYcdXeVE6UZy.

UPDATE users 
SET password = '$2a$10$FStH/qUT4ZxZCOgJQ1mVzepMFUjMPiqwiDRqHQ1ItYcdXeVE6UZy.'
WHERE username IN ('admin', 'kua_officer', 'dukcapil_op', 'kua_sawahan', 'kua_wungu', 'kua_mejayan', 'kua_geger', 'kua_saradan', 'kua_pilangkenceng', 'kua_kebonsari', 'kua_gemarang', 'kua_wonoasri', 'kua_dagangan', 'kua_kare', 'kua_dolopo', 'kua_jiwan', 'kua_balerejo', 'kua_madiun');

SELECT 'Password reset complete' as message;
SELECT username, role FROM users WHERE username IN ('admin', 'kua_officer', 'dukcapil_op');
