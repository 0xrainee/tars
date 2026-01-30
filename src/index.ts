#!/usr/bin/env node

import { program } from "commander";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  program
    .name("TARS")
    .description("AI-powered CLI coding assistant")
    .version("0.1.0");

  program.action(async () => {
    console.log("Come on TARS!");
  });

  program.parse();
}

main().catch(console.error);
