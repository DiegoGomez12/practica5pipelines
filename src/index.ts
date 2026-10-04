/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export interface Env {
    p6: D1Database;
}



export default {
    async fetch(request, env, ctx): Promise<Response> {
        const data = await this.queryDatabase(env.p6);

        // Si la petición viene de un navegador, mostramos una página bonita en HTML
        const acceptHeader = request.headers.get("Accept") || "";
        if (acceptHeader.includes("text/html")) {
            const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Worker - Práctica 5</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 0;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background-color: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
            text-align: center;
            font-size: 2rem;
        }
        p.subtitle {
            color: #7f8c8d;
            text-align: center;
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }
        .status-badge {
            display: inline-block;
            background-color: #2ecc71;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        th, td {
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        th {
            background-color: #f8f9fa;
            color: #2c3e50;
            font-weight: 600;
        }
        tr:last-child td {
            border-bottom: none;
        }
        tr:hover {
            background-color: #f5f7fa;
        }
        .footer {
            margin-top: 2rem;
            text-align: center;
            color: #95a5a6;
            font-size: 0.9rem;
            border-top: 1px solid #eee;
            padding-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center;">
            <span class="status-badge">🟢 API En línea</span>
        </div>
        <h1>¡Hola Diego! </h1>
        <p class="subtitle">Bienvenido al Worker de la Práctica 5 - Pipelines</p>
        
        <h3 style="color: #34495e; margin-bottom: 0.5rem;">Datos de la Base de Datos (D1)</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre / Datos</th>
                </tr>
            </thead>
            <tbody>
                ${data.length > 0
                    ? data.map(row => `<tr><td>${row.id || '-'}</td><td>${row.name || JSON.stringify(row)}</td></tr>`).join('')
                    : '<tr><td colspan="2" style="text-align: center; color: #7f8c8d;">No hay registros en la tabla users</td></tr>'
                }
            </tbody>
        </table>

        <div class="footer">
            Cloudflare Workers CI/CD • Entorno Configurado Correctamente
        </div>
    </div>
</body>
</html>
			`;
            return new Response(html, {
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        // Comportamiento original para tests y clientes API
        return Response.json({ message: "Hello Diego2!", dbData: data });
    },

    async queryDatabase(db: D1Database) {
        // Connect and execute a query
        const { results } = await db.prepare("SELECT * FROM users").all();
        return results;
    }


} satisfies ExportedHandler<Env>;

