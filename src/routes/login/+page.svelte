<script lang="ts">
	import { goto } from '$app/navigation';
	import LangSwitcher from '$lib/components/reusable/global/LangSwitcher.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as m from '$lib/paraglide/messages.js';
	import { languageTag } from '$lib/paraglide/runtime';
	import { loginSchema, type LoginSchema } from '$lib/trpc/schema/loginSchema.js';
	import { ChevronRight, HandMetal, Loader } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { z } from 'zod';

	type Props = {
		data: {
			form: SuperValidated<Infer<LoginSchema>>;
		}; // PageData coming from PageServerLoad
	};

	let { data }: Props = $props();

  let disabledForRedirect = $state(false);

	let loginMutate = trpc($page).user.login.createMutation({
		onSuccess: async (data) => {
      if(data.status !== 200) {
        toast.error(data.message || m.global_error_message());

        return;
      }

      disabledForRedirect = true;

			await goto('/discussion', { replaceState: true });
		},
		onError: () => {
			toast.error(m.global_error_message());
		},
		onSettled: () => {
			$loginMutate.reset();
		}
	});

	let form = superForm(data.form, {
		validators: zodClient(loginSchema()),
		onSubmit: ({ formData }) => {
			const data = Object.fromEntries(formData) as z.infer<LoginSchema>;

			$loginMutate.mutate(data);

      return false;
		}
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>Log-In</title>
	<meta name="description" content="Fullstack ForumGW app built with SvelteKit" />
</svelte:head>

<main class="min-h-screen flex flex-col justify-between items-center relative">
	<div class="absolute top-4 right-4">
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<div {...props}>
							<LangSwitcher />
						</div>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="left">
					<p>{m.change_lang_hint()}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>
	<div class="grow flex items-center">
		<Card class="w-max border-none shadow-none rounded-none">
			<CardHeader class="p-0">
				<CardTitle class="text-xl flex flex-col gap-2" level={1}>
					<div class="bg-foreground/5 rounded-md p-4 w-max">
						<HandMetal />
					</div>
					<br />
					{m.login_welcome()}
				</CardTitle>
				<CardDescription class="max-w-64">
					{m.login_detail()}
				</CardDescription>
			</CardHeader>

			<CardContent class="px-0 py-0 pt-4">
				<form method="POST" class="mt-4" use:enhance>
					<Form.Field {form} name="username">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									class="mt-2"
									bind:value={$formData.username}
									placeholder="Username"
									autofocus
									autocomplete="off"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									class="mt-2"
									bind:value={$formData.password}
									placeholder="Password"
									type="password"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button
						disabled={$loginMutate.isPending || disabledForRedirect}
						class="mt-4 w-full font-bold flex justify-between items-center"
					>
						<span>
							{#if disabledForRedirect}
								{m.login_button_success()}
							{:else}
								{m.login_button()}
							{/if}
						</span>
						{#if $loginMutate.isPending || disabledForRedirect}
							<Loader class="animate-spin" />
						{:else}
							<ChevronRight />
						{/if}
					</Form.Button>
				</form>
			</CardContent>
			<CardFooter class="p-0 pt-4 flex flex-col">
				<Separator />
				<Button variant="link" href="/register">{m.login_question_to_regis()}</Button>
			</CardFooter>
		</Card>
	</div>
	<footer class="py-10 flex flex-col items-center">
		<div class="flex items-center gap-2">
			<p class="font-bold flex items-center">
				<span>Forum</span>
				<a href="https://adics.xyz" class="text-red-600 underline-offset-4 hover:underline">GW</a>
			</p>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>©{new Date().getFullYear()}</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{m.footer_year()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
		{#if languageTag() === 'en'}
			<p class="text-sm mt-2 text-foreground/60">
				<span class="font-bold">"GW"</span> stands for <span class="font-bold">"Me" / "My"</span> in
				<a
					href="https://hinative.com/questions/25488315"
					class="underline-offset-4 hover:underline font-bold"
				>
					Bahasa
				</a>
			</p>
		{/if}
	</footer>
</main>
