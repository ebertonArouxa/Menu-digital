import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaListUl } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { InferType } from 'yup';

import ButtonSubmit from '@/components/ButtonSubmit';
import CheckboxInput from '@/components/CheckboxInput';
import ComplementInput from '@/components/ComplementInput';
import DefaultInput from '@/components/DefaultInput';

import { GetComplementByIdReturn } from '@/types/complement';
import { editItemPayload } from '@/types/item';

import { createItem } from '@/utils/api/createItem';
import { editComplement } from '@/utils/api/editComplement';
import { editItem } from '@/utils/api/editItem';
import { editProduct } from '@/utils/api/editProduct';
import { getComplementsById } from '@/utils/api/getComplementsById';

import { useProducts } from '@/hooks/useProducts';
import { createComplementFormSchema } from '@/yup/front/createComplementFormSchema';
import { useUser } from '@clerk/nextjs';
import { yupResolver } from '@hookform/resolvers/yup';

import SearchProductsList from '../CreateCategoryForm/SearchProductsList';
import styles from './styles.module.css';

type editComplementFormData = InferType<typeof createComplementFormSchema>;

interface EditComplementProps {
  setShowDialog: (value: boolean) => void;
  complementId: string;
}

function CreateComplementForm({
  setShowDialog,
  complementId,
}: EditComplementProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(createComplementFormSchema),
    mode: `onChange`,
    defaultValues: {
      productsIds: [],
    },
  });

  const [requestError, setRequestError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complements, setComplements] = useState<number[]>([]);
  const [complementById, setComplementById] =
    useState<GetComplementByIdReturn>();
  const { user } = useUser();
  const { products, gettingProducts } = useProducts(user?.id as string);
  const filteredProducts = products;

  useEffect(() => {
    const fetchComplementById = async () => {
      const complement = await getComplementsById(complementId);
      setComplementById(complement);
    };
    fetchComplementById();
  }, [complementId]);

  useEffect(() => {
    setValue(`name`, complementById ? complementById?.complements.name : ``);
    setValue(
      `maxAmount`,
      complementById ? complementById?.complements.maxAmount : 0
    );
    setValue(
      `required`,
      complementById?.complements.required === false ? `false` : `required`
    );
    complementById?.complements.items?.forEach((item, index) => {
      setValue(`items.${index}.name`, item.name);
      setValue(`items.${index}.price`, Number(item.price));
    });
    setValue(
      `productsIds`,
      complementById?.complements.productsComplements?.map(
        (product) => product.productsId
      )
    );
  }, [complementById, setValue]);

  const onSubmit = async (data: editComplementFormData) => {
    try {
      setIsSubmitting(true);
      const editedComplement = await editComplement({
        id: complementId,
        name: data.name,
        required: data.required === `required`,
        maxAmount: data.maxAmount,
      });

      if (!!data?.productsIds && data?.productsIds?.length > 0) {
        data.productsIds?.forEach(async (productId) => {
          await editProduct({
            id: productId as string,
            complementsId: [editedComplement.id],
          });
        });
      }

      if (!!data?.items && data.items?.length > 0) {
        const itemsIds = complementById?.complements.items?.map(
          (item) => item.id
        );
        if (itemsIds) {
          const insertIdOnItem = data.items.map((item, index) => {
            if (index <= itemsIds.length && itemsIds[index]) {
              return {
                ...item,
                id: itemsIds[index],
                complementId: editedComplement.id,
              };
            }
            return item;
          });
          const itemsToEdit = insertIdOnItem.filter(
            (_item, index) => index < itemsIds.length
          );
          const itemsToCreate = insertIdOnItem.filter(
            (_item, index) => index >= itemsIds.length
          );
          if (itemsToCreate.length > 0) {
            const itemsPayLoad = {
              complementId: editedComplement.id,
              items: itemsToCreate,
            };
            await createItem(itemsPayLoad);
          }

          itemsToEdit.forEach(async (item) => {
            await editItem(item as editItemPayload);
          });
        }
      }
      toast.success(`Adicional editado com sucesso!`);
    } catch (error) {
      setRequestError(true);
      toast.error(`Erro ao editar o adicional, tente novamente em instantes!`);
    } finally {
      setIsSubmitting(false);
    }
    setShowDialog(false);
  };

  const editableItems = complementById?.complements.items?.map((item) => ({
    name: item.name,
    price: item.price,
    id: item.id,
  }));

  const addComplement = () => {
    setComplements([...complements, complements.length + 1]);
  };

  const removeComplement = () => {
    setComplements(complements.slice(0, complements.length - 1));
  };

  return (
    <div className={styles.createComplementFormContainer}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.createComplementFormWrapper}
      >
        <div className={styles.createComplementForm}>
          <DefaultInput
            error={errors.name?.message}
            labelText="Nome do adicional:"
            register={register(`name`)}
            name="Nome do adicional*"
            Icon={<FaListUl />}
            placeholder="Ex.: Complementos, bebidas, bordas..."
          />
          <div className={styles.createComplementAmountInputWrapper}>
            <CheckboxInput
              text="Obrigatório"
              id="required"
              register={register(`required`)}
            />
            <label htmlFor="maximun">
              <input
                type="number"
                id="maximun"
                className={styles.createComplementAmountInput}
                placeholder="3"
                {...register(`maxAmount`)}
              />
              <span>Máximo</span>
              {errors.maxAmount ? (
                <p className={styles.defaultInputErrorMessage}>
                  {errors.maxAmount.message}
                </p>
              ) : null}
            </label>
          </div>
          <div>
            {editableItems &&
              editableItems?.map((item, index) => (
                <ComplementInput
                  key={`${item.name}-${item.price}}`}
                  itemName="name"
                  itemRegister={register(`items.${index}.name`)}
                  itemError={errors.items?.[index]?.name?.message}
                  priceName="price"
                  priceRegister={register(`items.${index}.price`)}
                  priceError={errors.items?.[index]?.price?.message}
                  index={index}
                />
              ))}
            {editableItems
              ? complements.map((complement, index) => (
                  <ComplementInput
                    key={complement + 1}
                    itemName="name"
                    itemRegister={register(
                      `items.${editableItems.length + index}.name`
                    )}
                    itemError={
                      errors.items?.[editableItems.length + index]?.name
                        ?.message
                    }
                    priceName="price"
                    priceRegister={register(
                      `items.${editableItems.length + index}.price`
                    )}
                    priceError={
                      errors.items?.[editableItems.length + index]?.price
                        ?.message
                    }
                    index={editableItems.length + index}
                  />
                ))
              : complements.map((complement, index) => (
                  <ComplementInput
                    key={complement + 1}
                    itemName="name"
                    itemRegister={register(`items.${index + 1}.name`)}
                    itemError={errors.items?.[index + 1]?.name?.message}
                    priceName="price"
                    priceRegister={register(`items.${index + 1}.price`)}
                    priceError={errors.items?.[index + 1]?.price?.message}
                    index={index + 1}
                  />
                ))}
            <div className={styles.createComplementButtonsWrapper}>
              <button
                type="button"
                onClick={addComplement}
                className={styles.createComplementAddAndRemoveComplementButton}
              >
                + itens
              </button>
              <button
                type="button"
                onClick={removeComplement}
                className={
                  complements.length === 0
                    ? styles.createComplementRemoveComplementButtonHidden
                    : styles.createComplementAddAndRemoveComplementButton
                }
              >
                - itens
              </button>
            </div>
            <SearchProductsList
              filteredProducts={filteredProducts}
              gettingProducts={gettingProducts}
              register={register(`productsIds`)}
            />
          </div>
        </div>
        <ButtonSubmit
          text="Concluir"
          isSubmiting={isSubmitting}
          className={styles.submitButton}
          submitError={requestError}
        />
      </form>
    </div>
  );
}

export default CreateComplementForm;
