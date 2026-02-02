#!/usr/bin/env node

import { program } from "commander";
import dotenv from "dotenv";
import { runCli } from "./core/ui";

dotenv.config();

async function main() {
  program
    .name("tars")
    .description("AI-powered CLI coding assistant")
    .version("0.1.0");

  program.action(async () => {
    await runCli();
  });

  program.parse();
}

main().catch(console.error);
