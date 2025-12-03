<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
    import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
    import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
    import FluentHeart24Filled from '~icons/fluent/heart-24-filled';
    import SimpleIconsTelegram from '~icons/simple-icons/telegram';
    import type { PageData } from './$types';
    import ChannelAvatar from '$lib/component/ChannelAvatar.svelte';
    import { favoritesStore } from '$lib/stores/favorites.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const { channel } = data;

    const BIAS_MAP: Record<string, string> = {
        '🇺🇦': 'Ukraine',
        '🇷🇺': 'Russia',
        '🇬🇧': 'United Kingdom',
        '🇯🇵': 'Japan',
        '🇨🇦': 'Canada'
    };

    let isFavorite = $state(false);

    onMount(() => {
        favoritesStore.initialize();
        isFavorite = favoritesStore.isFavorite(channel.channelId);
    });

    function goBack() {
        goto('/');
    }

    function editChannel() {
        goto(`/channel/${channel.channelId}/edit`);
    }

    function toggleFavorite() {
        favoritesStore.toggle(channel.channelId);
        isFavorite = favoritesStore.isFavorite(channel.channelId);
    }

    function getBiasLabel(biasValue: string): string {
        return BIAS_MAP[biasValue] || biasValue;
    }
</script>

<svelte:head>
    <title>{channel.channelName} - Channel Details</title>
    <meta name="description" content="Details for {channel.channelName} Telegram channel" />
    <meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Back Button -->
<div class="mb-8 flex items-center justify-between">
    <button
        onclick={goBack}
        class="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white transition-colors hover:border-white/40 hover:bg-white/10"
    >
        <FluentArrowLeft24Regular class="size-4 transition-transform group-hover:-translate-x-1" />
        <span class="text-sm font-medium">Back to Search</span>
    </button>
    
    <div class="flex items-center gap-2">
        <button
            onclick={toggleFavorite}
            class="group inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-white transition-colors {isFavorite 
                ? 'border-red-500/40 bg-red-500/10 hover:border-red-500/60 hover:bg-red-500/20' 
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'}"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {#if isFavorite}
                <FluentHeart24Filled class="size-4 text-red-400" />
            {:else}
                <FluentHeart24Regular class="size-4" />
            {/if}
            <span class="text-sm font-medium">{isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>
        
        <button
            onclick={editChannel}
            class="group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white transition-colors hover:border-white/40 hover:bg-white/10"
        >
            <FluentEdit24Regular class="size-4" />
            <span class="text-sm font-medium">Edit</span>
        </button>
    </div>
</div>

<!-- Channel Header Card -->
<div
    class="mb-8 rounded-lg border border-white/20 bg-white/5 p-8"
    style="view-transition-name: channel-{channel.channelId}"
>
    <div class="flex flex-col items-center gap-6 text-center">
        <ChannelAvatar 
            username={channel.username} 
            avatarUrl={channel.avatar}
            alt={channel.channelName}
            size="lg"
            priority={true}
        />

        <!-- Channel Info -->
        <div class="space-y-3">
            <h1 class="text-3xl font-bold text-white">
                {channel.channelName}
            </h1>
            <div class="flex flex-col items-center gap-2">
                {#if channel.username}
                    <p class="text-white/70">
                        @{channel.username}
                    </p>
                {/if}
                {#if channel.bias}
                    <div class="flex items-center gap-2 text-white/60">
                        <span class="text-sm">Region:</span>
                        <span class="text-sm font-medium">{getBiasLabel(channel.bias)}</span>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<!-- Action Buttons -->
<div class="space-y-3">
    {#if channel.username}
        <a
            href={`https://t.me/${channel.username}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-4 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
        >
            <SimpleIconsTelegram class="size-5" />
            Open in Telegram
        </a>
    {:else if channel.invite}
        <a
            href={`https://t.me/+${channel.invite}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-4 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
        >
            <SimpleIconsTelegram class="size-5" />
            Join Channel
        </a>
    {:else}
        <div
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-4 font-medium text-white/40"
        >
            <SimpleIconsTelegram class="size-5" />
            Channel can't be joined currently.
        </div>
    {/if}
</div>