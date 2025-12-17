import React, {useState} from 'react';
import {Box, Text, useApp} from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

type Item = {label: string; value: string};

const items: Item[] = [
	{label: 'New project', value: 'new'},
	{label: 'Open project', value: 'open'},
	{label: 'Exit', value: 'exit'}
];

export default function App() {
	const {exit} = useApp();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState('');
	const [mode, setMode] = useState<'menu' | 'input'>('menu');

	const handleSelect = (item: Item) => {
		if (item.value === 'exit') {
			exit();
			return;
		}

		if (item.value === 'new') {
			setMode('input');
			return;
		}

		if (item.value === 'open') {
			setLoading(true);
			setTimeout(() => setLoading(false), 800);
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan">TUI App — Starter</Text>

			{mode === 'menu' ? (
				<>
					<Box marginTop={1}>
						<SelectInput items={items} onSelect={handleSelect} />
					</Box>

					{loading && (
						<Box marginTop={1}>
							<Text>
								<Spinner /> Loading...
							</Text>
						</Box>
					)}
				</>
			) : (
				<Box flexDirection="column" marginTop={1}>
					<Box>
						<Text>Project name: </Text>
						<TextInput value={name} onChange={setName} onSubmit={() => setMode('menu')} />
					</Box>
					<Box marginTop={1}>
						<Text dimColor>Press enter to go back</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}
