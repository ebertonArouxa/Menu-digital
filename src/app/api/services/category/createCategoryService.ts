import { CategoryData } from '@/app/utils/validations/categoryDataValidation';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const createCategoryService = async ({
  companyId,
  name,
}: CategoryData) => {
  try {
    const categoryExists = await prisma.productCategories.findFirst({
      where: { name },
    });

    if (categoryExists) throw new Error(`Categoria já existe`);

    const categoy = await prisma.productCategories.create({
      data: {
        companyId,
        name,
      },
    });

    return categoy;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(error.message);
    }

    throw error;
  }
};
