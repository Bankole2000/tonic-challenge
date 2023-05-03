import logger from 'jet-logger';
import prisma from "../../lib/prisma"
import bankData from '../data/banks.json';

export const seedBankData = async () => {
  const banks = await prisma.bank.count();
  if (!banks) {
    logger.info('Seeding Bank Data')
    try {
      const result = await prisma.bank.createMany({
        data: bankData
      })
      logger.info({ result });
    } catch (error: any) {
      logger.err(error.message);
    }
  }
}