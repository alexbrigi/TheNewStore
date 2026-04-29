const WHATSAPP_LINK = '#';
const TELEGRAM_LINK = '#';

import { useState } from 'react';

const Contact = () => {
  const [supplierOpen, setSupplierOpen] = useState(false);

  return (
    <div className="bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_55%)]" />
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
                Contacto directo
              </span>
              <h1 className="mt-5 text-4xl lg:text-5xl font-black leading-tight">
                Hablemos de tu proximo pedido
              </h1>
              <p className="mt-4 text-slate-300 text-lg max-w-xl">
                Resolvemos dudas, gestionamos pedidos y te damos soporte personalizado. Elige el canal que prefieras y te respondemos rapido.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="mailto:soporte@thenewstore.com" className="rounded-lg bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100">
                  Enviar email
                </a>
                <a href="#formulario" className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                  Ir al formulario
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Soporte</p>
                <p className="mt-2 text-lg font-semibold">soporte@thenewstore.com</p>
                <p className="text-sm text-slate-400">Estamos a tu disposicion todos los dias de la semana.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Pedidos y envios',
              text: 'Consulta estado, cambios, devoluciones o incidencias con tu envio.'
            },
            {
              title: 'Atencion a coleccionistas',
              text: '¿Buscas una carta concreta? Te ayudamos a conseguirla.'
            },
            {
              title: 'Eventos y reservas',
              text: 'Pregunta por reservas o por algun producto que te gustaria que estuviera en nuestra tienda. Siempre estamos dispuestos a abrir puertas a nuevos productos.'
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 p-6">
            <h3 className="text-xl font-bold">Comunidad WhatsApp</h3>
            <p className="mt-2 text-sm text-slate-300">
              Accede a drops, avisos de reposicion y chat en tiempo real.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 00-8.53 15.22L2 22l4.93-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.18-1.15l-.3-.18-2.9.76.78-2.82-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.26-.13-1.54-.76-1.78-.85-.24-.09-.42-.13-.6.13-.18.26-.68.85-.83 1.03-.15.18-.3.2-.56.07-.26-.13-1.1-.4-2.1-1.28-.78-.7-1.3-1.57-1.45-1.83-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.18-.26.26-.43.09-.18.04-.33-.02-.46-.06-.13-.6-1.45-.83-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.46.06-.7.33-.24.26-.92.9-.92 2.2 0 1.3.94 2.56 1.07 2.74.13.18 1.85 2.83 4.48 3.97.63.27 1.12.44 1.5.56.63.2 1.2.17 1.65.1.5-.08 1.54-.63 1.76-1.24.22-.6.22-1.12.15-1.24-.07-.11-.24-.18-.5-.31z" />
                </svg>
              </span>
              Unirme a WhatsApp
            </a>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-900 p-6">
            <h3 className="text-xl font-bold">Comunidad Telegram</h3>
            <p className="mt-2 text-sm text-slate-300">
              Comparte decklists, noticias y novedades con el resto de jugadores.
            </p>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M21.6 4.7a1 1 0 00-1.05-.14L2.7 11.7a1 1 0 00.08 1.87l4.5 1.4 1.72 5.43a1 1 0 001.58.5l2.7-2.08 4.45 3.25a1 1 0 001.57-.6l3-12.2a1 1 0 00-.7-1.67zM9.7 15.3l-.3 2.94-1-3.2 8.7-6.6-7.4 6.86z" />
                </svg>
              </span>
              Unirme a Telegram
            </a>
          </div>
        </div>
      </section>

      <section id="formulario" className="max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-bold mb-4">Formulario de contacto</h3>
            <form className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Apellidos"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <input
                type="text"
                placeholder="Asunto"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <textarea
                rows={5}
                placeholder="Escribe tu mensaje"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <label className="flex items-start gap-3 text-xs text-slate-400">
                <input type="checkbox" className="mt-1" />
                Acepto la politica de privacidad y el uso de mis datos para responder esta consulta.
              </label>
              <button type="button" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Enviar mensaje
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h4 className="text-lg font-bold">¿Eres proveedor?</h4>
              <p className="mt-2 text-sm text-slate-300">
                Si quieres trabajar con nosotros, envianos tu propuesta a traves de este formulario.
              </p>
              <button
                type="button"
                onClick={() => setSupplierOpen(true)}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Abrir formulario para proveedores
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-bold mb-4">Preguntas rapidas</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">¿Cuanto tarda un envio?</p>
                <p className="text-slate-400">Entre 24 y 72 horas para envios nacionales.</p>
              </div>
              <div>
                <p className="font-semibold text-white">¿Puedo reservar un producto?</p>
                <p className="text-slate-400">No, cada producto que sale en pre-compra sera vendido y reservado por la gente que lo compre hasta que se quede sin stock el producto.</p>
              </div>
              <div>
                <p className="font-semibold text-white">¿Que metodos de pago aceptais?</p>
                <p className="text-slate-400">Tarjeta y proximamente PayPal y transferencia bancaria.</p>
              </div>
              <div>
                <p className="font-semibold text-white">¿Puedo devolver una caja o producto despues de haberlo recogido?</p>
                <p className="text-slate-400">Siempre y cuando el contenido del producto no haya sido manipulado o en condiciones deplorables. No habra devolucion si hay sospechas de producto resellado.</p>
              </div>
              <div>
                <p className="font-semibold text-white">¿Todo lo que vendeis son productos originales?</p>
                <p className="text-slate-400">Todos nuestros productos son 100% originales, nuestros proveedores son los mas confiables del mercado.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {supplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSupplierOpen(false)} />
          <div className="relative w-11/12 max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSupplierOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold">Formulario para proveedores</h3>
            <p className="mt-2 text-sm text-slate-300">
              Cuentanos sobre tu empresa y que tipo de productos ofreces.
            </p>
            <form className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Empresa"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Persona de contacto"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Email de contacto"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <input
                type="text"
                placeholder="Web o catalogo"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <textarea
                rows={5}
                placeholder="Describe tu propuesta"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />
              <button type="button" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Enviar propuesta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
