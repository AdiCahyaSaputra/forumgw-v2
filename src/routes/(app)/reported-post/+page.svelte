<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import LoadingState from '$lib/components/reusable/global/LoadingState.svelte';
	import CardPost from '$lib/components/reusable/discussion/CardPost.svelte';
	import { Siren } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import ConfirmDialog from '$lib/components/reusable/global/ConfirmDialog.svelte';
	import { writable } from 'svelte/store';
	import { toast } from 'svelte-sonner';
  import * as m from '$lib/paraglide/messages.js';
	import { trpcClientUtils } from '$lib/utils';

	let open = $state(false);

  let reportedMessageFilter = writable({
    postId: ''
  });

	const reportedPost = trpc($page).post.getReportedPost.createQuery();
	const reportedPostMessages = trpc($page).report.getReportMessage.createQuery(reportedMessageFilter);

  const safePostMutate = trpc($page).report.safePost.createMutation({
		onSuccess: (data) => {
			if (data.status !== 200) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			trpcClientUtils($page).post.getReportedPost.invalidate();
			trpcClientUtils($page).report.getReportMessage.invalidate();

			open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$safePostMutate.reset();
		}
  });

  const takeDownPostMutate = trpc($page).report.takeDownPost.createMutation({
		onSuccess: (data) => {
			if (data.status !== 201) {
				toast.error(data.message || m.global_error_message());

				return;
			}

			trpcClientUtils($page).post.getReportedPost.invalidate();
			trpcClientUtils($page).report.getReportMessage.invalidate();

			open = false;
			toast.success(data.message);
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$takeDownPostMutate.reset();
		}
  });
</script>

<svelte:head>
	<title>Reported Post</title>
	<meta name="description" content="ForumGW Reported Post: Manage users reported posts" />
</svelte:head>

<div class="p-4 border-b sticky top-0 bg-white">
  <h1 class="text-lg font-bold">Reported Post</h1>
</div>

<section>
	<LoadingState isLoading={$reportedPost.isPending}>
		{#snippet loadingFallback()}
			<div class="w-full py-20 bg-secondary rounded-md"></div>
		{/snippet}

		{#if $reportedPost.data}
			{#each $reportedPost.data.data as post, idx (idx)}
				<CardPost {post}>
					{#snippet customActions()}
						<ConfirmDialog
							bind:open
							title="Report Messages"
							description={$reportedPostMessages.data?.data.map((report) => report.message).join(', ')}
							cancel={m.post_form_report_safe()}
							submit={m.post_form_report_take_down()}
							onCancel={() => $safePostMutate.mutate({ postId: post.id })}
							onSubmit={() => $takeDownPostMutate.mutate({ postId: post.id })}
							isPending={$takeDownPostMutate.isPending}
						/>

						<Button 
              onclick={() => {
                open = true;
                $reportedMessageFilter.postId = post.id;
              }} 
              variant="destructive"
            >
              {m.post_form_report_button()}
            </Button>
					{/snippet}
				</CardPost>
			{/each}
		{/if}
	</LoadingState>
</section>
