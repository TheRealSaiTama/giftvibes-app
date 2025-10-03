"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
const prisma = new client_1.PrismaClient();
async function main() {
    const diaryFiles = [
        'RE Products Page - Hardbound Diaries.csv',
        'RE Products Page - Premium PU Leather Diaries.csv',
    ];
    for (const file of diaryFiles) {
        const csvPath = path.resolve(__dirname, `../csv/${file}`);
        const csvData = fs.readFileSync(csvPath, 'utf-8');
        const records = (0, sync_1.parse)(csvData, {
            columns: true,
            skip_empty_lines: true,
        });
        for (const record of records) {
            const priceRange = record['Price Range'].replace('/-', '').trim().split(' - ');
            const minPrice = parseInt(priceRange[0], 10);
            const maxPrice = parseInt(priceRange[1], 10);
            await prisma.diary.create({
                data: {
                    name: record['Product Name'],
                    description: record['Short Description'],
                    price: isNaN(minPrice) ? 0 : minPrice,
                    imageUrl: record['Product image'],
                    category: record['Categories'],
                    tags: record['Tags'],
                },
            });
        }
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
