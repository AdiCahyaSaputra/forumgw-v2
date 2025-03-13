<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { registerSchema, type RegisterSchema } from '$lib/trpc/schema/registerSchema.js';
	import * as m from '$lib/paraglide/messages.js';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import LangSwitcher from '$lib/components/reusable/global/LangSwitcher.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight, Loader, Users } from '@lucide/svelte';
	import { languageTag } from '$lib/paraglide/runtime';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { ActionResult } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	type Props = {
		data: {
			form: SuperValidated<Infer<RegisterSchema>>;
		};
	};

	let { data }: Props = $props();

	let registerLoading = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(registerSchema()),
		onSubmit: () => {
			registerLoading = true;
		},
		onResult: async ({ result }) => {
			formResult = result;
			registerLoading = false;
		},
		onUpdate: async ({ result }) => {
			switch (result.type) {
				case 'failure':
					toast.error(result.data?.message || m.global_error_message());
					break;
				case 'success':
					await goto('/login', { replaceState: true });
					break;
				default:
					toast.error(m.global_error_message());
			}
		},
		onError: () => {
			toast.error(m.global_error_message());
		}
	});

	const { form: formData, enhance, submitting } = form;

	let formResult: ActionResult | null = $state(null);
</script>

<svelte:head>
	<title>Register</title>
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
						<Users />
					</div>
					<br />
					{m.register_title()}
				</CardTitle>
				<CardDescription class="max-w-64">
					{m.register_detail()}
				</CardDescription>
			</CardHeader>

			<CardContent class="px-0 py-0 pt-4">
				<form method="POST" use:enhance class="mt-4">
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									class="mt-2"
									bind:value={$formData.name}
									placeholder="Fullname"
									autofocus
									autocomplete="off"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="username">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									class="mt-2"
									bind:value={$formData.username}
									placeholder="Username"
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
						disabled={registerLoading || formResult?.type === 'success'}
						class="mt-4 w-full font-bold flex justify-between items-center"
					>
						<span>
							{#if formResult?.type === 'success'}
								{m.register_button_success()}
							{:else}
								{m.register_button()}
							{/if}
						</span>
						{#if registerLoading || formResult?.type === 'success'}
							<Loader class="animate-spin" />
						{:else}
							<ChevronRight />
						{/if}
					</Form.Button>
				</form>
			</CardContent>
			<CardFooter class="p-0 pt-4 flex flex-col">
				<Separator />
				<Button variant="link" href="/login">
					{m.register_question_to_login()}
				</Button>
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
