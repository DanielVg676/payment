import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBIT_HOST || 'amqp://localhost'; // Valor por defecto si no está en .env
const RABBITMQ_EXCHANGE = 'payment_event';
const RABBITMQ_ROUTING_KEY = 'payment.created';

let channel; // Variable para mantener el canal abierto

// Función para conectar y crear el canal (se ejecuta solo una vez)
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', { durable: true });
    console.log('Conectado a RabbitMQ y exchange configurado');

    // Manejar cierre de conexión
    connection.on('error', (err) => {
      console.error('Error en la conexión a RabbitMQ:', err.message);
      channel = null; // Reiniciar el canal en caso de error
    });

    connection.on('close', () => {
      console.log('Conexión a RabbitMQ cerrada');
      channel = null;
    });

    return channel;
  } catch (error) {
    console.error('Error al conectar con RabbitMQ:', error.message);
    throw error;
  }
}

// Función para obtener o inicializar el canal
async function getChannel() {
  if (!channel) {
    await connectRabbitMQ();
  }
  return channel;
}

// Función para publicar el evento de pago creado
export async function paymentCreatedEvent(payment) {
  try {
    const ch = await getChannel();

    // Convertir los datos del pago a formato JSON
    const message = JSON.stringify(payment);

    // Publicar el mensaje en el exchange con la routing key
    ch.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, Buffer.from(message), {
      persistent: true, // Asegura que el mensaje se guarde en disco si el broker se cae
    });

    console.log(`[x] Enviado mensaje: ${message}`);
  } catch (error) {
    console.error('Error al publicar el evento en RabbitMQ:', error.message);
    throw error; // Relanzar el error para que captureOrder lo maneje
  }
}

// Inicializar la conexión al cargar el módulo (opcional)
getChannel().catch((err) => {
  console.error('Fallo inicial al conectar con RabbitMQ:', err.message);
});