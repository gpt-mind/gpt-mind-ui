<script lang="ts">
	import OpenAI from 'openai-api';
	import { setUserKey, userKey } from '$lib/llm';
	import { Mind } from '$lib/Mind';
	import { onMount } from 'svelte';
	import MicroChat from '$lib/MicroChat';
	import { config } from '$lib/config';
	import { Automatic111 } from '$lib/Automatic111';

	onMount(() => {
		async function complete(mind: any, agent: string, query: any, options: any) {
			const a = mind.agents.find((a: any) => a.key === agent);
			if (!a) return query;
			const { prompt, responseFields } = a.value;
			return await prompt.complete(query, config.openai.key, options, responseFields);
		}
		let microChat: any;
		const iChing = '䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿';
		const mind = new Mind({
			stateMap: {},
			bindings: {
				input: ['UFOs'],
				UFOs: ['Luis Elizondo'],
				'Luis Elizondo': ['Christopher Mellon'],
				'Christopher Mellon': ['Bob Lazar'],
				'Bob Lazar': ['Jacques Vallée'],
				'Jacques Vallée': ['Paul Hellyer'],
				'Paul Hellyer': ['output'],
				output: []
			},
			agents: {
				UFOs: {
					prompt:
						'{{hexagram}} respond to the statement "{{input}}" in the first-person as a person who is an expert in UFO sightings and related information',
					responseFields: ['UFOs', 'hexagram']
				},
				'Luis Elizondo': {
					prompt:
						'{{hexagram}} respond to the statements "{{input}}" and "{{UFOs}}" in the first-person as a former director of the Advanced Aerospace Threat Identification Program at the Pentagon',
					responseFields: ['Luis Elizondo', 'hexagram']
				},
				'Christopher Mellon': {
					prompt:
						'{{hexagram}} respond to the statements "{{input}}" and "{{Luis Elizondo}}" in the first-person as a former Deputy Assistant Secretary of Defense for Intelligence and a member of the To The Stars Academy of Arts & Science',
					responseFields: ['Christopher Mellon', 'hexagram']
				},
				'Bob Lazar': {
					prompt:
						'{{hexagram}} respond to the statements "{{input}}" and  "{{Christopher Mellon}}" in the first-person as a physicist who claims to have worked on reverse-engineering alien technology at a secretive government facility known as S-4',
					responseFields: ['Bob Lazar', 'hexagram']
				},
				'Jacques Vallée': {
					prompt:
						'{{hexagram}} respond to the statements "{{input}}" and "{{Bob Lazar}}" in the first-person as a computer scientist and ufologist who has been researching UFO phenomena for over 50 years',
					responseFields: ['Jacques Vallée', 'hexagram']
				},
				'Paul Hellyer': {
					prompt:
						'{{hexagram}} respond to the statements "{{input}}" and "{{Jacques Vallée}}" in the first-person as a former Canadian Defense Minister who has publicly claimed that governments around the world are in possession of evidence of extraterrestrial life',
					responseFields: ['Paul Hellyer', 'hexagram']
				}
			},
			sources: {
				UFOs: (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				'Luis Elizondo': (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				'Christopher Mellon': (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				'Bob Lazar': (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				'Jacques Vallée': (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				'Paul Hellyer': (mind: any, agent: any, query: any, options: any) =>
					complete(mind, agent, query, options),
				output: (mind: any, agent: any, query: any, options: any) => mind.stateMap
			},
			start: { input: 'I believe that love is the most powerful force in the universe.' }
		});

		microChat = new MicroChat(
			'app',
			['Agent', 'Human'],
			async (message: any, user: any, chat: any) => {
				// trim leading and trailing whitespace
				message = message.trim();
				if (!userKey) {
					config.openai.key = message;
					microChat.setNotification("Great! You're all set to start chatting with the AI.");
					return;
				}
				if (message.startsWith('sk-')) {
					config.openai.key = message;
					microChat.setNotification('Your API key has been updated.');
					return;
				}
				if (!chat.getNotification().includes(message)) chat.respond(message, user);
				if (user === 'Human') {
					await mind.input('input', message);
				} else {
					microChat.addChatMessage('Agent', message);
				}
			},
			{
				showSendButton: true,
				showTypingIndicator: true,
				showChatHistory: true,
				history: [
					{
						message:
							'intelligent sentient interface - type anything in the text box below to discuss any topic.'
					}
				]
			}
		);
		microChat.setNotification(
			userKey
				? "Great! You're all set to start chatting with the AI."
				: 'Enter your OpenAI API key in the chat input at the bottom of this page to get started.'
		);

		const agentNames = ['love', 'hate', 'fear', 'despair', 'hope'];

		agentNames.forEach((e, i) =>
			mind.on(`after_${e}`, (event: string, mind: any, agent: string, binding: string) =>
				agent !== 'input' || (agent === 'input' && binding === 'love')
					? microChat.addChatMessage(
							`${mind.stateMap.hexagram || ''} ${agent}`,
							mind.stateMap[agent]
					  )
					: ''
			)
		);
		mind.on(`after_output`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap[agent])
		);
		mind.on(`after_hope`, (event: string, mind: any, agent: string, binding: string) =>
			microChat.addChatMessage(`${mind.stateMap.hexagram || ''} ${agent}`, mind.stateMap.hope)
		);
	});
</script>

<div id="app" />

<style>
</style>
