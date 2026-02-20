#!/usr/bin/env node
import { Command } from 'commander';
import { runSkillCommand } from '@chain-skills/skills';

const program = new Command();

program
  .name('chain-skills')
  .description('Chain Skills Pack CLI')
  .version('0.1.0')
  .requiredOption('-c, --command <name>', 'Skill command (e.g. token.balance)')
  .requiredOption('-i, --input <json>', 'JSON payload')
  .action(async (opts) => {
    const payload = JSON.parse(opts.input);
    const result = await runSkillCommand(opts.command, payload);
    console.log(JSON.stringify(result, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2));
  });

void program.parseAsync();
