/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InfiniteData } from '@tanstack/svelte-query';

type BaseEntity = {
  id: number | string;
  [key: string]: any;
};

type OptimisticUpdateConfig<T extends BaseEntity> = {
  previousData: InfiniteData<any> | undefined;
  operation: 'create' | 'update' | 'delete';
  entityData: T;
  findIndex?: (item: T) => boolean;
  customTransform?: (data: T) => T;
  pageIndex?: number;
};

export function handleOptimisticUpdate<T extends BaseEntity>({
  previousData,
  operation,
  entityData,
  findIndex = (item: BaseEntity) => item.id === entityData.id,
  customTransform = (data) => ({ ...data }),
  pageIndex = 0
}: OptimisticUpdateConfig<T>) {
  if (!previousData) return { pages: [], pageParams: [] };

  const newPages = [...previousData.pages];

  if (newPages.length > 0 && newPages[pageIndex]?.data?.results) {
    const results = [...newPages[pageIndex].data.results];

    switch (operation) {
      case 'create': {
        const transformedData = customTransform({
          ...entityData,
          id: entityData.id ?? Math.floor(Math.random() * 10) + Date.now(),
          statusLoading: true
        } as T);
        newPages[pageIndex].data.results = [transformedData, ...results];
        break;
      }
      case 'update': {
        const index = results.findIndex(findIndex);
        if (index !== -1) {
          const transformedData = customTransform({
            ...entityData,
            statusLoading: true
          } as T);
          results[index] = transformedData;
          newPages[pageIndex].data.results = results;
        }
        break;
      }
      case 'delete': {
        const index = results.findIndex(findIndex);
        if (index !== -1) {
          results.splice(index, 1);
          newPages[pageIndex].data.results = results;
        }
        break;
      }
    }
  }

  return {
    ...previousData,
    newPages
  };
}