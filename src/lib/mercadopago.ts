import { MercadoPagoConfig } from "mercadopago";

if (!process.env.TEST_ACCESS_TOKEN) {
    throw new Error("Missing TEST_ACCESS_TOKEN environment variable");
}

const mercadoPagoClient = new MercadoPagoConfig({
    accessToken: process.env.TEST_ACCESS_TOKEN,
});

export default mercadoPagoClient;