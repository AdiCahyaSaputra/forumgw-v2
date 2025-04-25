/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InfiniteData } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import * as m from '$lib/paraglide/messages.js';

type BaseEntity = {
	id: number | string | null;
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
          const editedData = results[index];

					const transformedData = customTransform({
						...editedData,
						statusLoading: true
					} as typeof editedData & { statusLoading: true });

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

export function handleOnError(context: unknown, previousResultsHandler: (errCtx: { previousResults: InfiniteData<any> | undefined }) => void) {
	const errCtx = context as { previousResults: InfiniteData<any> | undefined };

	if (errCtx?.previousResults) {
    previousResultsHandler(errCtx);
	}

	toast.error(m.global_error_message());
}
