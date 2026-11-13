require('dotenv').config();

const readline = require('node:readline/promises');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const ask = async (question) => {
    const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        return (await terminal.question(question)).trim();
    } finally {
        terminal.close();
    }
};

const askPassword = () => new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
        reject(new Error('Ejecuta este comando desde una terminal interactiva para ingresar la contraseña de forma segura.'));
        return;
    }

    process.stdout.write('Contraseña (mínimo 8 caracteres; no se mostrará): ');
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let password = '';
    const cleanup = () => {
        process.stdin.removeListener('data', onData);
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
    };
    const onData = (buffer) => {
        for (const char of buffer.toString('utf8')) {
            if (char === '\u0003') {
                cleanup();
                reject(new Error('Operación cancelada.'));
                return;
            }
            if (char === '\r' || char === '\n') {
                cleanup();
                resolve(password);
                return;
            }
            if (char === '\u0008' || char === '\u007f') {
                password = password.slice(0, -1);
                continue;
            }
            if (char >= ' ' && char !== '\u007f') password += char;
        }
    };

    process.stdin.on('data', onData);
});

async function main() {
    const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admins.length) {
        throw new Error('Ya existe una cuenta admin en esta base. No se creó ningún usuario.');
    }

    const name = await ask('Nombre del administrador: ');
    const email = (await ask('Correo del administrador: ')).toLowerCase();
    const password = await askPassword();

    if (!name) throw new Error('El nombre es obligatorio.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingresa un correo válido.');
    if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, 'admin']
    );

    console.log(`Cuenta admin creada (id ${result.insertId}, ${email}). La contraseña se guardó con bcrypt.`);
}

main()
    .catch((error) => {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Ese correo ya está registrado. Revisa la cuenta existente; no se cambió su rol.');
        } else {
            console.error(error.message);
        }
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
