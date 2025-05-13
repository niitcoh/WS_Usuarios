const Usuario = require('../models/usuario.model');
const Token = require('../models/token.model');
const authConfig = require('../config/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.getByEmail(email);
    
    // Verificar si existe el usuario
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }
    
    // Verificar contraseña
    const passwordValida = await Usuario.validatePassword(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = authConfig.generateToken(usuario.id, usuario.email, usuario.rol);
    
    // Actualizar último acceso
    await Usuario.updateLastAccess(usuario.id);
    
    // Datos a devolver (sin password)
    delete usuario.password;
    
    // Obtener direcciones
    const direcciones = await Usuario.getDireccionesByUsuarioId(usuario.id);
    
    res.status(200).json({
      message: 'Login exitoso',
      token,
      usuario: {
        ...usuario,
        direcciones
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { 
      rut, 
      nombre, 
      apellido, 
      email, 
      password, 
      telefono, 
      direccion,
      comuna,
      ciudad,
      region
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son requeridos' 
      });
    }
    
    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.getByEmail(email);
    
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    // Verificar si ya existe un usuario con ese RUT (si se proporciona)
    if (rut) {
      const rutExistente = await Usuario.getByRut(rut);
      
      if (rutExistente) {
        return res.status(400).json({ message: 'El RUT ya está registrado' });
      }
    }
    
    // Crear el usuario (por defecto con rol 'cliente')
    const usuarioId = await Usuario.create({
      rut: rut || `${Math.floor(Math.random() * 20000000) + 5000000}-${Math.floor(Math.random() * 10)}`,
      nombre,
      apellido: apellido || 'No especificado',
      email,
      password,
      telefono,
      rol: 'cliente',
      // Datos de dirección si se proporcionan
      direccion,
      comuna,
      ciudad,
      region
    });
    
    // Obtener el usuario creado
    const nuevoUsuario = await Usuario.getById(usuarioId);
    
    // Generar token JWT
    const token = authConfig.generateToken(nuevoUsuario.id, nuevoUsuario.email, nuevoUsuario.rol);
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }
    
    // Verificar si existe el usuario
    const usuario = await Usuario.getByEmail(email);
    
    if (!usuario) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' });
    }
    
    // Generar token de recuperación
    const { token } = await Token.createRecoveryToken(usuario.id);
    
    if (!token) {
      return res.status(500).json({ message: 'Error al generar token de recuperación' });
    }
    
    // Enviar email con link de recuperación
    const resetUrl = `http://localhost:5500/reset-password.html?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña - Ferremas',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1a4d7c;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }
    
    // Validar token
    const tokenInfo = await Token.validateToken(token, 'reset_password');
    
    if (!tokenInfo) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    
    // Cambiar contraseña
    await Usuario.changePassword(tokenInfo.usuario_id, newPassword);
    
    // Marcar token como usado
    await Token.markAsUsed(tokenInfo.id);
    
    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.validateToken = (req, res) => {
  // El middleware auth.middleware.js ya validó el token
  // Solo retornamos los datos del usuario obtenidos de req.user
  res.status(200).json({
    message: 'Token válido',
    usuario: req.user
  });
};
