#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        if (argumentList.length > 0) {
          output = output.concat([
            helper.styleTitle("Arguments:"),
            ...argumentList,
            ""
          ]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return callFormatItem(
            helper.styleOptionTerm(helper.optionTerm(option)),
            helper.styleOptionDescription(helper.optionDescription(option))
          );
        });
        if (optionList.length > 0) {
          output = output.concat([
            helper.styleTitle("Options:"),
            ...optionList,
            ""
          ]);
        }
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              helper.styleTitle("Global Options:"),
              ...globalOptionList,
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return callFormatItem(
            helper.styleSubcommandTerm(helper.subcommandTerm(cmd2)),
            helper.styleSubcommandDescription(helper.subcommandDescription(cmd2))
          );
        });
        if (commandList.length > 0) {
          output = output.concat([
            helper.styleTitle("Commands:"),
            ...commandList,
            ""
          ]);
        }
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str) {
        return stripColor(str).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str) {
        return str;
      }
      styleUsage(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleOptionDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleSubcommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleArgumentDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleDescriptionText(str) {
        return str;
      }
      styleOptionTerm(str) {
        return this.styleOptionText(str);
      }
      styleSubcommandTerm(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str) {
        return this.styleArgumentText(str);
      }
      styleOptionText(str) {
        return str;
      }
      styleArgumentText(str) {
        return str;
      }
      styleSubcommandText(str) {
        return str;
      }
      styleCommandText(str) {
        return str;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str) {
        return /\n[^\S\r\n]/.test(str);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str, width) {
        if (width < this.minWidthToWrap) return str;
        const rawLines = str.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str.replace(sgrPattern, "");
    }
    exports2.Help = Help2;
    exports2.stripColor = stripColor;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path16 = require("node:path");
    var fs15 = require("node:fs");
    var process2 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          outputError: (str, write) => write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str) => stripColor(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs15.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path16.resolve(baseDir, baseName);
          if (fs15.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path16.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs15.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs15.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path16.resolve(
            path16.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path16.basename(
              this._scriptPath,
              path16.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path16.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path16.basename(filename, path16.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path17) {
        if (path17 === void 0) return this._executableDir;
        this._executableDir = path17;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text = helper.formatHelp(this, helper);
        if (context.hasColors) return text;
        return this._outputConfiguration.stripColor(text);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str) => this._outputConfiguration.writeErr(str);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str) => this._outputConfiguration.writeOut(str);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str) => {
          if (!hasColors) str = this._outputConfiguration.stripColor(str);
          return baseWrite(str);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process2.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
        return false;
      if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports2.Command = Command2;
    exports2.useColor = useColor;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js"() {
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js"() {
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js"() {
    init_ZodError();
    init_util();
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js"() {
    init_en();
    overrideErrorMap = en_default;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js"() {
    init_errors();
    init_en();
    makeIssue = (params) => {
      const { data, path: path16, errorMaps, issueData } = params;
      const fullPath = [...path16, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.js"() {
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js"() {
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js"() {
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      constructor(parent, value, path16, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path16;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = /* @__PURE__ */ Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    NEVER = INVALID;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js"() {
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js
var init_zod = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js"() {
    init_external();
    init_external();
  }
});

// packages/core/dist/types.js
var MessageContentSchema, MessageEnvelopeSchema, ReplyEnvelopeSchema, ApprovalModeSchema, SandboxConfigSchema, ToolConfigSchema, ProviderRefSchema, AgentConfigSchema, ChannelConfigSchema, BindingConfigSchema, DeviceConfigSchema, VoiceConfigSchema, LoggingConfigSchema, StorageConfigSchema, GatewayConfigSchema, MxClawConfigSchema;
var init_types2 = __esm({
  "packages/core/dist/types.js"() {
    "use strict";
    init_zod();
    MessageContentSchema = external_exports.discriminatedUnion("type", [
      external_exports.object({ type: external_exports.literal("text"), text: external_exports.string() }),
      external_exports.object({ type: external_exports.literal("image"), url: external_exports.string(), alt: external_exports.string().optional() }),
      external_exports.object({ type: external_exports.literal("audio"), url: external_exports.string(), transcript: external_exports.string().optional() }),
      external_exports.object({ type: external_exports.literal("video"), url: external_exports.string() }),
      external_exports.object({ type: external_exports.literal("file"), url: external_exports.string(), name: external_exports.string(), mimeType: external_exports.string().optional() }),
      external_exports.object({ type: external_exports.literal("location"), lat: external_exports.number(), lng: external_exports.number(), label: external_exports.string().optional() }),
      external_exports.object({ type: external_exports.literal("sticker"), id: external_exports.string(), url: external_exports.string().optional() }),
      external_exports.object({ type: external_exports.literal("reaction"), emoji: external_exports.string(), messageId: external_exports.string() }),
      external_exports.object({ type: external_exports.literal("canvas"), json: external_exports.record(external_exports.unknown()) })
    ]);
    MessageEnvelopeSchema = external_exports.object({
      id: external_exports.string(),
      channel: external_exports.string(),
      channelType: external_exports.string(),
      sender: external_exports.object({
        id: external_exports.string(),
        displayName: external_exports.string(),
        avatarUrl: external_exports.string().optional(),
        isBot: external_exports.boolean().default(false)
      }),
      conversationId: external_exports.string(),
      threadId: external_exports.string().optional(),
      content: external_exports.array(MessageContentSchema),
      mentions: external_exports.array(external_exports.string()).default([]),
      isGroupMessage: external_exports.boolean().default(false),
      isMentioned: external_exports.boolean().default(false),
      timestamp: external_exports.number(),
      metadata: external_exports.record(external_exports.unknown()).default({})
    });
    ReplyEnvelopeSchema = external_exports.object({
      channelMessageId: external_exports.string().optional(),
      conversationId: external_exports.string(),
      threadId: external_exports.string().optional(),
      content: external_exports.array(MessageContentSchema),
      isStreaming: external_exports.boolean().default(false),
      streamDone: external_exports.boolean().optional(),
      streamToken: external_exports.string().optional(),
      metadata: external_exports.record(external_exports.unknown()).default({})
    });
    ApprovalModeSchema = external_exports.enum([
      "always-require-approval",
      "owner-only",
      "yolo"
    ]);
    SandboxConfigSchema = external_exports.object({
      enabled: external_exports.boolean().default(false),
      type: external_exports.enum(["docker", "ssh"]).default("docker"),
      image: external_exports.string().optional(),
      host: external_exports.string().optional(),
      port: external_exports.number().optional(),
      username: external_exports.string().optional()
    });
    ToolConfigSchema = external_exports.object({
      bash: external_exports.object({ enabled: external_exports.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      browser: external_exports.object({ enabled: external_exports.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      canvas: external_exports.object({ enabled: external_exports.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
      cron: external_exports.object({ enabled: external_exports.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      sessionSpawn: external_exports.object({ enabled: external_exports.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
      imageGen: external_exports.object({ enabled: external_exports.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      fileRead: external_exports.object({ enabled: external_exports.boolean().default(true), approval: ApprovalModeSchema.default("owner-only"), allowedPaths: external_exports.array(external_exports.string()).default(["~/.mxclaw/workspace"]) }).default({}),
      fileWrite: external_exports.object({ enabled: external_exports.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval"), allowedPaths: external_exports.array(external_exports.string()).default(["~/.mxclaw/workspace"]) }).default({})
    });
    ProviderRefSchema = external_exports.object({
      provider: external_exports.string(),
      model: external_exports.string(),
      apiKey: external_exports.string().optional(),
      baseUrl: external_exports.string().optional(),
      preset: external_exports.string().optional(),
      headers: external_exports.record(external_exports.string()).optional(),
      modelAliases: external_exports.record(external_exports.string()).optional(),
      temperature: external_exports.number().min(0).max(2).default(0.7),
      maxTokens: external_exports.number().positive().default(4096),
      systemPrompt: external_exports.string().optional(),
      options: external_exports.record(external_exports.unknown()).default({})
    });
    AgentConfigSchema = external_exports.object({
      id: external_exports.string(),
      name: external_exports.string(),
      description: external_exports.string().optional(),
      model: ProviderRefSchema,
      fallbackChain: external_exports.array(ProviderRefSchema).default([]),
      tools: ToolConfigSchema.default({}),
      sandbox: SandboxConfigSchema.default({}),
      systemPrompt: external_exports.string().optional(),
      mentionGating: external_exports.boolean().default(true),
      maxSessionTurns: external_exports.number().positive().default(100),
      compactionThreshold: external_exports.number().positive().default(50),
      voice: external_exports.object({
        provider: external_exports.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
        voiceId: external_exports.string().optional(),
        wakeWord: external_exports.string().optional()
      }).default({})
    });
    ChannelConfigSchema = external_exports.object({
      id: external_exports.string(),
      type: external_exports.string(),
      enabled: external_exports.boolean().default(true),
      credentials: external_exports.record(external_exports.unknown()).default({}),
      options: external_exports.record(external_exports.unknown()).default({}),
      allowlist: external_exports.array(external_exports.string()).default([]),
      mentionGating: external_exports.boolean().default(true),
      pairingEnabled: external_exports.boolean().default(true)
    });
    BindingConfigSchema = external_exports.object({
      channelId: external_exports.string(),
      senderId: external_exports.string().optional(),
      agentId: external_exports.string(),
      conversationId: external_exports.string().optional()
    });
    DeviceConfigSchema = external_exports.object({
      id: external_exports.string(),
      name: external_exports.string(),
      type: external_exports.enum(["mobile", "desktop", "web"]),
      token: external_exports.string().optional(),
      paired: external_exports.boolean().default(false),
      lastSeen: external_exports.number().optional()
    });
    VoiceConfigSchema = external_exports.object({
      defaultProvider: external_exports.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
      openaiRealtime: external_exports.object({ apiKey: external_exports.string().optional(), model: external_exports.string().default("gpt-4o-realtime-preview"), voice: external_exports.string().default("alloy") }).default({}),
      geminiLive: external_exports.object({ apiKey: external_exports.string().optional(), model: external_exports.string().default("gemini-2.0-flash-live-001"), voice: external_exports.string().default("Puck") }).default({}),
      elevenlabs: external_exports.object({ apiKey: external_exports.string().optional(), voiceId: external_exports.string().default("21m00Tcm4TlvDq8ikWAM") }).default({}),
      systemTts: external_exports.object({ rate: external_exports.number().default(1), pitch: external_exports.number().default(1) }).default({})
    });
    LoggingConfigSchema = external_exports.object({
      level: external_exports.enum(["silent", "error", "warn", "info", "debug", "trace"]).default("info"),
      subsystems: external_exports.record(external_exports.enum(["silent", "error", "warn", "info", "debug", "trace"])).default({}),
      file: external_exports.string().optional(),
      otel: external_exports.object({
        enabled: external_exports.boolean().default(false),
        endpoint: external_exports.string().optional(),
        headers: external_exports.record(external_exports.string()).default({})
      }).default({})
    });
    StorageConfigSchema = external_exports.object({
      type: external_exports.enum(["jsonl", "sqlite"]).default("jsonl"),
      workspacePath: external_exports.string().default("~/.mxclaw/workspace"),
      lanceDbPath: external_exports.string().default("~/.mxclaw/lancedb"),
      sqlitePath: external_exports.string().default("~/.mxclaw/mxclaw.db")
    });
    GatewayConfigSchema = external_exports.object({
      host: external_exports.string().default("127.0.0.1"),
      port: external_exports.number().int().positive().default(18700),
      webhookPath: external_exports.string().default("/gateway/webhook"),
      corsOrigins: external_exports.array(external_exports.string()).default(["http://localhost:5173"]),
      wsHeartbeatIntervalMs: external_exports.number().positive().default(3e4),
      apiToken: external_exports.string().optional()
    });
    MxClawConfigSchema = external_exports.object({
      version: external_exports.literal(1),
      gateway: GatewayConfigSchema.default({}),
      agents: external_exports.record(AgentConfigSchema).default({}),
      defaultAgentId: external_exports.string().optional(),
      ownerId: external_exports.string().optional(),
      channels: external_exports.record(ChannelConfigSchema).default({}),
      bindings: external_exports.array(BindingConfigSchema).default([]),
      devices: external_exports.array(DeviceConfigSchema).default([]),
      voice: VoiceConfigSchema.default({}),
      logging: LoggingConfigSchema.default({}),
      storage: StorageConfigSchema.default({}),
      plugins: external_exports.array(external_exports.string()).default([]),
      sandbox: SandboxConfigSchema.default({})
    });
  }
});

// packages/core/dist/config.js
function getConfigPath() {
  return CONFIG_PATH;
}
function getConfigDir() {
  return CONFIG_DIR;
}
function getWorkspacePath(config) {
  const raw = config?.storage?.workspacePath ?? "~/.mxclaw/workspace";
  return raw.replace(/^~/, os.homedir());
}
function getLanceDbPath(config) {
  const raw = config?.storage?.lanceDbPath ?? "~/.mxclaw/lancedb";
  return raw.replace(/^~/, os.homedir());
}
function getSqlitePath(config) {
  const raw = config?.storage?.sqlitePath ?? "~/.mxclaw/mxclaw.db";
  return raw.replace(/^~/, os.homedir());
}
function loadConfig(configPath) {
  const targetPath = configPath ?? CONFIG_PATH;
  if (!fs.existsSync(targetPath)) {
    const defaultConfig = MxClawConfigSchema.parse({ version: 1 });
    ensureConfigDir();
    fs.writeFileSync(targetPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }
  try {
    const raw = fs.readFileSync(targetPath, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = MxClawConfigSchema.parse(parsed);
    saveSnapshot(validated);
    return validated;
  } catch (err) {
    console.error("[config] Failed to load config, trying snapshot fallback:", err);
    return loadSnapshot();
  }
}
function saveConfig(config, configPath) {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();
  const validated = MxClawConfigSchema.parse(config);
  fs.writeFileSync(targetPath, JSON.stringify(validated, null, 2), "utf-8");
  saveSnapshot(validated);
}
function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error("No config snapshot available; cannot recover config");
  }
  const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return MxClawConfigSchema.parse(parsed);
}
function saveSnapshot(config) {
  ensureConfigDir();
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(config, null, 2), "utf-8");
}
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}
function watchConfig(onConfigChange, configPath) {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();
  let debounceTimer = null;
  const watcher = fs.watch(targetPath, (eventType) => {
    if (eventType === "change") {
      if (debounceTimer)
        clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const newConfig = loadConfig(targetPath);
          onConfigChange(newConfig);
        } catch (err) {
          console.error("[config] Hot-reload failed:", err);
        }
      }, 500);
    }
  });
  watcher.on("error", (err) => {
    console.error("[config] Watcher error:", err);
  });
  return () => {
    if (debounceTimer)
      clearTimeout(debounceTimer);
    watcher.close();
  };
}
function generateDefaultConfig() {
  return MxClawConfigSchema.parse({
    version: 1,
    gateway: { host: "127.0.0.1", port: 18700 },
    agents: {
      default: {
        id: "default",
        name: "Default Agent",
        description: "The default mxclaw agent",
        model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096 },
        fallbackChain: [
          { provider: "anthropic", model: "claude-sonnet-4-20250514", temperature: 0.7, maxTokens: 4096 },
          { provider: "groq", model: "llama-3.3-70b-versatile", temperature: 0.7, maxTokens: 4096 }
        ],
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] },
          canvas: { enabled: true, approval: "owner-only" },
          sessionSpawn: { enabled: true, approval: "owner-only" }
        },
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      }
    },
    defaultAgentId: "default",
    channels: {},
    bindings: [],
    devices: [],
    plugins: []
  });
}
var fs, path, os, CONFIG_DIR, CONFIG_PATH, SNAPSHOT_PATH;
var init_config = __esm({
  "packages/core/dist/config.js"() {
    "use strict";
    init_types2();
    fs = __toESM(require("node:fs"), 1);
    path = __toESM(require("node:path"), 1);
    os = __toESM(require("node:os"), 1);
    CONFIG_DIR = path.join(os.homedir(), ".mxclaw");
    CONFIG_PATH = path.join(CONFIG_DIR, "mxclaw.json");
    SNAPSHOT_PATH = path.join(CONFIG_DIR, "mxclaw.snapshot.json");
  }
});

// packages/core/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  AgentConfigSchema: () => AgentConfigSchema,
  ApprovalModeSchema: () => ApprovalModeSchema,
  BindingConfigSchema: () => BindingConfigSchema,
  ChannelConfigSchema: () => ChannelConfigSchema,
  DeviceConfigSchema: () => DeviceConfigSchema,
  GatewayConfigSchema: () => GatewayConfigSchema,
  LoggingConfigSchema: () => LoggingConfigSchema,
  MessageContentSchema: () => MessageContentSchema,
  MessageEnvelopeSchema: () => MessageEnvelopeSchema,
  MxClawConfigSchema: () => MxClawConfigSchema,
  ProviderRefSchema: () => ProviderRefSchema,
  ReplyEnvelopeSchema: () => ReplyEnvelopeSchema,
  SandboxConfigSchema: () => SandboxConfigSchema,
  StorageConfigSchema: () => StorageConfigSchema,
  ToolConfigSchema: () => ToolConfigSchema,
  VoiceConfigSchema: () => VoiceConfigSchema,
  generateDefaultConfig: () => generateDefaultConfig,
  getConfigDir: () => getConfigDir,
  getConfigPath: () => getConfigPath,
  getLanceDbPath: () => getLanceDbPath,
  getSqlitePath: () => getSqlitePath,
  getWorkspacePath: () => getWorkspacePath,
  loadConfig: () => loadConfig,
  loadSnapshot: () => loadSnapshot,
  saveConfig: () => saveConfig,
  watchConfig: () => watchConfig
});
var init_dist = __esm({
  "packages/core/dist/index.js"() {
    "use strict";
    init_types2();
    init_config();
  }
});

// packages/plugin-system/dist/index.js
function createPluginRegistry() {
  return {
    channels: /* @__PURE__ */ new Map(),
    providers: /* @__PURE__ */ new Map(),
    voices: /* @__PURE__ */ new Map(),
    pluginErrors: []
  };
}
async function loadPlugins(config, registry) {
  const pluginNames = config.plugins ?? [];
  const builtinPlugins = scanBuiltinPlugins();
  const npmPlugins = scanNpmPlugins();
  const allPlugins = [.../* @__PURE__ */ new Set([...builtinPlugins, ...npmPlugins, ...pluginNames])];
  for (const pluginName of allPlugins) {
    try {
      await activatePlugin(pluginName, config, registry);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      registry.pluginErrors.push({ plugin: pluginName, error: errorMsg });
      console.error(`[plugin-system] Failed to load plugin "${pluginName}":`, errorMsg);
    }
  }
}
function scanBuiltinPlugins() {
  const plugins = [];
  const packagesDir = path2.resolve(import_meta.dirname ?? ".", "../../..");
  if (!fs2.existsSync(packagesDir))
    return plugins;
  const entries = fs2.readdirSync(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory())
      continue;
    const manifestPath = path2.join(packagesDir, entry.name, "manifest.json");
    if (fs2.existsSync(manifestPath)) {
      plugins.push(entry.name);
    }
  }
  return plugins;
}
function scanNpmPlugins() {
  const plugins = [];
  const prefixes = ["mxclaw-channel-", "mxclaw-provider-", "mxclaw-voice-"];
  for (const prefix of prefixes) {
    try {
      const nodeModulesPath = path2.resolve(import_meta.dirname ?? ".", "../../../node_modules");
      if (!fs2.existsSync(nodeModulesPath))
        continue;
      const scopedPath = path2.join(nodeModulesPath, "@mxclaw");
      if (fs2.existsSync(scopedPath)) {
        const scoped = fs2.readdirSync(scopedPath, { withFileTypes: true });
        for (const entry of scoped) {
          if (entry.isDirectory()) {
            const manifestPath = path2.join(scopedPath, entry.name, "manifest.json");
            if (fs2.existsSync(manifestPath)) {
              plugins.push(`@mxclaw/${entry.name}`);
            }
          }
        }
      }
      const entries = fs2.readdirSync(nodeModulesPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(prefix)) {
          const manifestPath = path2.join(nodeModulesPath, entry.name, "manifest.json");
          if (fs2.existsSync(manifestPath)) {
            plugins.push(entry.name);
          }
        }
      }
    } catch {
    }
  }
  return plugins;
}
async function activatePlugin(pluginName, config, registry) {
  let manifest;
  let modulePath;
  try {
    const localPath = path2.resolve(import_meta.dirname ?? ".", "../../..", pluginName.startsWith("@") ? pluginName.split("/")[1] ?? pluginName : pluginName);
    const localManifest = path2.join(localPath, "manifest.json");
    if (fs2.existsSync(localManifest)) {
      manifest = JSON.parse(fs2.readFileSync(localManifest, "utf-8"));
      modulePath = path2.join(localPath, manifest.main);
    } else {
      const pkgPath = require2.resolve(`${pluginName}/manifest.json`);
      manifest = JSON.parse(fs2.readFileSync(pkgPath, "utf-8"));
      modulePath = require2.resolve(`${pluginName}/${manifest.main}`);
    }
  } catch {
    throw new Error(`Cannot resolve plugin "${pluginName}": manifest.json not found`);
  }
  const channelConfigs = Object.values(config.channels ?? {});
  const hasChannelOfType = channelConfigs.some((c) => c.type === pluginName);
  if (manifest.type === "channel" && !hasChannelOfType) {
    return;
  }
  const mod = await import(modulePath);
  const plugin = mod.default ?? mod;
  switch (manifest.type) {
    case "channel":
      registry.channels.set(manifest.name, plugin);
      break;
    case "provider":
      registry.providers.set(manifest.name, plugin);
      break;
    case "voice":
      registry.voices.set(manifest.name, plugin);
      break;
  }
  console.log(`[plugin-system] Activated ${manifest.type} plugin: ${manifest.name} v${manifest.version}`);
}
function getChannelPlugin(registry, channelType) {
  return registry.channels.get(channelType);
}
function getProviderPlugin(registry, providerName) {
  return registry.providers.get(providerName);
}
var fs2, path2, import_node_module, import_meta, require2;
var init_dist2 = __esm({
  "packages/plugin-system/dist/index.js"() {
    "use strict";
    fs2 = __toESM(require("node:fs"), 1);
    path2 = __toESM(require("node:path"), 1);
    import_node_module = require("node:module");
    import_meta = {};
    require2 = (0, import_node_module.createRequire)(import_meta.url);
  }
});

// packages/gateway/dist/rate-limiter.js
var RateLimiter, IPRateLimiter;
var init_rate_limiter = __esm({
  "packages/gateway/dist/rate-limiter.js"() {
    "use strict";
    RateLimiter = class {
      store = /* @__PURE__ */ new Map();
      config;
      cleanupInterval;
      constructor(config) {
        this.config = {
          windowMs: config?.windowMs ?? 6e4,
          maxRequests: config?.maxRequests ?? 60
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), 6e4);
      }
      check(key) {
        const now = Date.now();
        let entry = this.store.get(key);
        if (!entry || now > entry.resetAt) {
          entry = { count: 0, resetAt: now + this.config.windowMs };
          this.store.set(key, entry);
        }
        entry.count++;
        const remaining = Math.max(0, this.config.maxRequests - entry.count);
        const allowed = entry.count <= this.config.maxRequests;
        return { allowed, remaining, resetAt: entry.resetAt };
      }
      isRateLimited(key) {
        return !this.check(key).allowed;
      }
      getRemaining(key) {
        return this.check(key).remaining;
      }
      reset(key) {
        this.store.delete(key);
      }
      cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
          if (now > entry.resetAt) {
            this.store.delete(key);
          }
        }
      }
      shutdown() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
      }
    };
    IPRateLimiter = class {
      limiter = new RateLimiter({ windowMs: 6e4, maxRequests: 100 });
      check(ip) {
        const result = this.limiter.check(ip);
        return { allowed: result.allowed, remaining: result.remaining };
      }
      shutdown() {
        this.limiter.shutdown();
      }
    };
  }
});

// packages/storage/dist/memory.js
var fs3, fsSync, path3, crypto;
var init_memory = __esm({
  "packages/storage/dist/memory.js"() {
    "use strict";
    init_dist();
    fs3 = __toESM(require("node:fs/promises"), 1);
    fsSync = __toESM(require("node:fs"), 1);
    path3 = __toESM(require("node:path"), 1);
    crypto = __toESM(require("node:crypto"), 1);
  }
});

// packages/storage/dist/sqlite-adapter.js
function cosineDistance(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) * (a[i] ?? 0);
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  if (normA === 0 || normB === 0)
    return 1;
  return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
var path4, fs4, SqliteStorageAdapter;
var init_sqlite_adapter = __esm({
  "packages/storage/dist/sqlite-adapter.js"() {
    "use strict";
    init_dist();
    path4 = __toESM(require("node:path"), 1);
    fs4 = __toESM(require("node:fs"), 1);
    SqliteStorageAdapter = class {
      db;
      dbPath;
      constructor(config) {
        this.dbPath = getSqlitePath(config);
        fs4.mkdirSync(path4.dirname(this.dbPath), { recursive: true });
      }
      async initialize() {
        const Database = (await import("better-sqlite3")).default;
        this.db = new Database(this.dbPath);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        timestamp INTEGER NOT NULL,
        token_count INTEGER,
        PRIMARY KEY (agent_id, session_key, turn_index)
      );

      CREATE TABLE IF NOT EXISTS session_manifests (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_active_at INTEGER NOT NULL,
        turn_count INTEGER NOT NULL DEFAULT 0,
        compaction_points TEXT NOT NULL DEFAULT '[]',
        PRIMARY KEY (agent_id, session_key)
      );

      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        vector BLOB NOT NULL,
        metadata TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        embedding BLOB,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id, session_key);
      CREATE INDEX IF NOT EXISTS idx_manifests_agent ON session_manifests(agent_id);
      CREATE INDEX IF NOT EXISTS idx_manifests_active ON session_manifests(last_active_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_updated ON memory(updated_at DESC);
    `);
      }
      async getSessionTranscript(agentId, sessionKey) {
        const rows = this.db.prepare("SELECT role, content, tool_calls, tool_results, timestamp, token_count FROM sessions WHERE agent_id = ? AND session_key = ? ORDER BY turn_index ASC").all(agentId, sessionKey);
        return rows.map((row) => ({
          role: row.role,
          content: row.content,
          toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : void 0,
          toolResults: row.tool_results ? JSON.parse(row.tool_results) : void 0,
          timestamp: row.timestamp,
          tokenCount: row.token_count ?? void 0
        }));
      }
      async appendTurn(agentId, sessionKey, turn) {
        const maxIndex = this.db.prepare("SELECT COALESCE(MAX(turn_index), -1) as max_idx FROM sessions WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, maxIndex.max_idx + 1, turn.role, turn.content, turn.toolCalls ? JSON.stringify(turn.toolCalls) : null, turn.toolResults ? JSON.stringify(turn.toolResults) : null, turn.timestamp, turn.tokenCount ?? null);
        this.db.prepare("UPDATE session_manifests SET last_active_at = ?, turn_count = turn_count + 1 WHERE agent_id = ? AND session_key = ?").run(Date.now(), agentId, sessionKey);
      }
      async getSessionManifest(agentId, sessionKey) {
        const row = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        if (!row)
          return null;
        return {
          agentId: row.agent_id,
          sessionKey: row.session_key,
          channelId: row.channel_id,
          senderId: row.sender_id,
          conversationId: row.conversation_id,
          createdAt: row.created_at,
          lastActiveAt: row.last_active_at,
          turnCount: row.turn_count,
          compactionPoints: JSON.parse(row.compaction_points)
        };
      }
      async upsertSessionManifest(manifest) {
        this.db.prepare(`
      INSERT INTO session_manifests (agent_id, session_key, channel_id, sender_id, conversation_id, created_at, last_active_at, turn_count, compaction_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(agent_id, session_key) DO UPDATE SET
        last_active_at = excluded.last_active_at,
        turn_count = excluded.turn_count,
        compaction_points = excluded.compaction_points
    `).run(manifest.agentId, manifest.sessionKey, manifest.channelId, manifest.senderId, manifest.conversationId, manifest.createdAt, manifest.lastActiveAt, manifest.turnCount, JSON.stringify(manifest.compactionPoints));
      }
      async listSessions(agentId) {
        const rows = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? ORDER BY last_active_at DESC").all(agentId);
        return rows.map((row) => ({
          agentId: row.agent_id,
          sessionKey: row.session_key,
          channelId: row.channel_id,
          senderId: row.sender_id,
          conversationId: row.conversation_id,
          createdAt: row.created_at,
          lastActiveAt: row.last_active_at,
          turnCount: row.turn_count,
          compactionPoints: JSON.parse(row.compaction_points)
        }));
      }
      async deleteSession(agentId, sessionKey) {
        this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
        this.db.prepare("DELETE FROM session_manifests WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
      }
      async storeEmbedding(id, vector, metadata) {
        const buf = Buffer.from(new Float32Array(vector).buffer);
        this.db.prepare("INSERT OR REPLACE INTO embeddings (id, vector, metadata) VALUES (?, ?, ?)").run(id, buf, JSON.stringify(metadata));
      }
      async searchEmbeddings(queryVector, limit = 10) {
        const rows = this.db.prepare("SELECT id, vector, metadata FROM embeddings").all();
        const query = new Float32Array(queryVector);
        const results = rows.map((row) => {
          const stored = new Float32Array(row.vector.buffer, row.vector.byteOffset, row.vector.byteLength / 4);
          return {
            id: row.id,
            metadata: JSON.parse(row.metadata),
            distance: cosineDistance(query, stored)
          };
        });
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
      }
      async rewriteSession(agentId, sessionKey, turns) {
        const tx = this.db.transaction(() => {
          this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
          for (let i = 0; i < turns.length; i++) {
            const t = turns[i];
            this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, i, t.role, t.content, t.toolCalls ? JSON.stringify(t.toolCalls) : null, t.toolResults ? JSON.stringify(t.toolResults) : null, t.timestamp, t.tokenCount ?? null);
          }
        });
        tx();
      }
      async close() {
        this.db.close();
      }
    };
  }
});

// packages/storage/dist/index.js
function cosineDistance2(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) * (a[i] ?? 0);
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  if (normA === 0 || normB === 0)
    return 1;
  return 1 - dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function deriveSessionKey(channelId, senderId, agentId) {
  const hash = crypto2.createHash("sha256");
  hash.update(`${channelId}:${senderId}:${agentId}`);
  return hash.digest("hex").slice(0, 16);
}
async function compactSession(storage, agentId, sessionKey, compactionThreshold, summarizer) {
  const turns = await storage.getSessionTranscript(agentId, sessionKey);
  if (turns.length <= compactionThreshold)
    return turns;
  const recentTurns = turns.slice(-Math.floor(compactionThreshold / 2));
  const olderTurns = turns.slice(0, -Math.floor(compactionThreshold / 2));
  const summary = await summarizer(olderTurns);
  const summaryTurn = {
    role: "system",
    content: `[SESSION COMPACTION] Previous conversation summary:
${summary}`,
    timestamp: Date.now()
  };
  return [summaryTurn, ...recentTurns];
}
var fs5, fsSync2, path5, crypto2, JsonlStorageAdapter;
var init_dist3 = __esm({
  "packages/storage/dist/index.js"() {
    "use strict";
    init_dist();
    fs5 = __toESM(require("node:fs/promises"), 1);
    fsSync2 = __toESM(require("node:fs"), 1);
    path5 = __toESM(require("node:path"), 1);
    crypto2 = __toESM(require("node:crypto"), 1);
    init_memory();
    init_sqlite_adapter();
    JsonlStorageAdapter = class {
      workspacePath;
      manifestsPath;
      embeddingsPath;
      pairingPath;
      devicesPath;
      queuePath;
      constructor(config) {
        this.workspacePath = getWorkspacePath(config);
        this.manifestsPath = path5.join(this.workspacePath, "manifests");
        this.embeddingsPath = path5.join(this.workspacePath, "embeddings");
        this.pairingPath = path5.join(this.workspacePath, "pairing.json");
        this.devicesPath = path5.join(this.workspacePath, "devices.json");
        this.queuePath = path5.join(this.workspacePath, "queue.json");
      }
      async initialize() {
        await fs5.mkdir(this.workspacePath, { recursive: true });
        await fs5.mkdir(this.manifestsPath, { recursive: true });
        await fs5.mkdir(this.embeddingsPath, { recursive: true });
        for (const p of [this.pairingPath, this.devicesPath, this.queuePath]) {
          try {
            await fs5.access(p);
          } catch {
            await fs5.writeFile(p, "[]", "utf-8");
          }
        }
      }
      getSessionPath(agentId, sessionKey) {
        const dir = path5.join(this.workspacePath, agentId, "sessions");
        fsSync2.mkdirSync(dir, { recursive: true });
        return path5.join(dir, `${sessionKey}.jsonl`);
      }
      async ensureSessionDir(agentId) {
        const dir = path5.join(this.workspacePath, agentId, "sessions");
        await fs5.mkdir(dir, { recursive: true });
        return dir;
      }
      async ensureManifestDir(agentId) {
        const dir = path5.join(this.manifestsPath, agentId);
        await fs5.mkdir(dir, { recursive: true });
        return dir;
      }
      getManifestPath(agentId, sessionKey) {
        fsSync2.mkdirSync(path5.join(this.manifestsPath, agentId), { recursive: true });
        return path5.join(this.manifestsPath, agentId, `${sessionKey}.json`);
      }
      async getSessionTranscript(agentId, sessionKey) {
        await this.ensureSessionDir(agentId);
        const filePath = path5.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        try {
          const content = await fs5.readFile(filePath, "utf-8");
          const lines = content.trim().split("\n").filter(Boolean);
          return lines.map((line) => JSON.parse(line));
        } catch {
          return [];
        }
      }
      async appendTurn(agentId, sessionKey, turn) {
        await this.ensureSessionDir(agentId);
        const filePath = path5.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        const line = JSON.stringify(turn) + "\n";
        await fs5.appendFile(filePath, line, "utf-8");
        await this.ensureManifestDir(agentId);
        const manifestPath = path5.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          const raw = await fs5.readFile(manifestPath, "utf-8");
          const manifest = JSON.parse(raw);
          manifest.lastActiveAt = Date.now();
          manifest.turnCount += 1;
          await fs5.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
        } catch {
        }
      }
      async getSessionManifest(agentId, sessionKey) {
        await this.ensureManifestDir(agentId);
        const manifestPath = path5.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          const raw = await fs5.readFile(manifestPath, "utf-8");
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      async upsertSessionManifest(manifest) {
        await this.ensureManifestDir(manifest.agentId);
        const manifestPath = path5.join(this.manifestsPath, manifest.agentId, `${manifest.sessionKey}.json`);
        await fs5.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
      }
      async listSessions(agentId) {
        const dir = path5.join(this.manifestsPath, agentId);
        try {
          await fs5.access(dir);
        } catch {
          return [];
        }
        const files = (await fs5.readdir(dir)).filter((f) => f.endsWith(".json"));
        const manifests = [];
        for (const f of files) {
          try {
            const raw = await fs5.readFile(path5.join(dir, f), "utf-8");
            manifests.push(JSON.parse(raw));
          } catch {
          }
        }
        return manifests.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
      }
      async deleteSession(agentId, sessionKey) {
        const sessionDir = path5.join(this.workspacePath, agentId, "sessions");
        const filePath = path5.join(sessionDir, `${sessionKey}.jsonl`);
        try {
          await fs5.unlink(filePath);
        } catch {
        }
        const manifestPath = path5.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          await fs5.unlink(manifestPath);
        } catch {
        }
      }
      async storeEmbedding(id, vector, metadata) {
        const embPath = path5.join(this.embeddingsPath, `${id}.json`);
        await fs5.writeFile(embPath, JSON.stringify({ id, vector, metadata }), "utf-8");
      }
      async searchEmbeddings(vector, limit = 10) {
        try {
          await fs5.access(this.embeddingsPath);
        } catch {
          return [];
        }
        const files = (await fs5.readdir(this.embeddingsPath)).filter((f) => f.endsWith(".json"));
        const queryVec = new Float32Array(vector);
        const results = [];
        for (const file of files) {
          try {
            const raw = await fs5.readFile(path5.join(this.embeddingsPath, file), "utf-8");
            const data = JSON.parse(raw);
            const storedVec = new Float32Array(data.vector);
            const distance = cosineDistance2(queryVec, storedVec);
            results.push({ id: data.id, metadata: data.metadata, distance });
          } catch {
          }
        }
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
      }
      async rewriteSession(agentId, sessionKey, turns) {
        const filePath = this.getSessionPath(agentId, sessionKey);
        await fs5.writeFile(filePath, turns.map((t) => JSON.stringify(t) + "\n").join(""), "utf-8");
      }
      async close() {
      }
    };
  }
});

// packages/security/dist/index.js
function generatePairingCode(channelId, senderId) {
  const code = crypto3.randomBytes(4).toString("hex").toUpperCase();
  const pairing = {
    code,
    channelId,
    senderId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1e3
    // 5 minute expiry
  };
  pairingCodes.set(code, pairing);
  return pairing;
}
function validatePairingCode(code) {
  const pairing = pairingCodes.get(code);
  if (!pairing)
    return null;
  if (Date.now() > pairing.expiresAt) {
    pairingCodes.delete(code);
    return null;
  }
  pairingCodes.delete(code);
  return pairing;
}
function isSenderAllowed(envelope, channelConfig) {
  const allowlist = channelConfig.allowlist ?? [];
  if (allowlist.length === 0) {
    return !channelConfig.pairingEnabled;
  }
  return allowlist.includes(envelope.sender.id);
}
function shouldRespondToMessage(envelope, agentConfig, channelConfig) {
  if (!envelope.isGroupMessage)
    return true;
  const channelMentionGating = channelConfig.mentionGating ?? true;
  if (!channelMentionGating)
    return true;
  const agentMentionGating = agentConfig.mentionGating ?? true;
  if (!agentMentionGating)
    return true;
  return envelope.isMentioned;
}
function generateDeviceToken() {
  return crypto3.randomBytes(32).toString("base64url");
}
function hashToken(token) {
  return crypto3.createHash("sha256").update(token).digest("hex");
}
function pairDevice(deviceId, deviceName) {
  const token = generateDeviceToken();
  const session = {
    deviceId,
    token,
    tokenHash: hashToken(token),
    createdAt: Date.now(),
    lastRotatedAt: Date.now()
  };
  deviceSessions.set(deviceId, session);
  return session;
}
function rotateDeviceToken(deviceId) {
  const existing = deviceSessions.get(deviceId);
  if (!existing)
    return null;
  const newToken = generateDeviceToken();
  const session = {
    ...existing,
    token: newToken,
    tokenHash: hashToken(newToken),
    lastRotatedAt: Date.now()
  };
  deviceSessions.set(deviceId, session);
  return session;
}
function validateDeviceToken(deviceId, token) {
  const session = deviceSessions.get(deviceId);
  if (!session)
    return false;
  return hashToken(token) === session.tokenHash;
}
function requiresApproval(toolName, agentConfig, senderId, ownerId) {
  const toolConfig = agentConfig.tools?.[toolName];
  if (!toolConfig?.enabled)
    return false;
  const mode = toolConfig.approval ?? "always-require-approval";
  switch (mode) {
    case "yolo":
      return false;
    case "owner-only":
      return senderId !== ownerId;
    case "always-require-approval":
    default:
      return true;
  }
}
function getSandboxCommand(sandbox, command) {
  if (!sandbox.enabled)
    return command;
  if (sandbox.type === "docker") {
    const image = sandbox.image ?? "mxclaw-sandbox:latest";
    return `docker run --rm -i --network none ${image} bash -c ${JSON.stringify(command)}`;
  }
  if (sandbox.type === "ssh") {
    const host = sandbox.host ?? "localhost";
    const port = sandbox.port ?? 22;
    const user = sandbox.username ?? "mxclaw";
    return `ssh -p ${port} ${user}@${host} ${JSON.stringify(command)}`;
  }
  return command;
}
var crypto3, pairingCodes, deviceSessions;
var init_dist4 = __esm({
  "packages/security/dist/index.js"() {
    "use strict";
    crypto3 = __toESM(require("node:crypto"), 1);
    pairingCodes = /* @__PURE__ */ new Map();
    deviceSessions = /* @__PURE__ */ new Map();
  }
});

// packages/security/dist/secrets.js
var fs6, path6, crypto4, SecretsManager;
var init_secrets = __esm({
  "packages/security/dist/secrets.js"() {
    "use strict";
    fs6 = __toESM(require("node:fs/promises"), 1);
    path6 = __toESM(require("node:path"), 1);
    crypto4 = __toESM(require("node:crypto"), 1);
    SecretsManager = class {
      vault = /* @__PURE__ */ new Map();
      vaultPath;
      encryptionKey;
      constructor(workspacePath, masterPassword) {
        this.vaultPath = path6.join(workspacePath, ".secrets.vault");
        const seed = masterPassword ?? `mxclaw-${process.env.USER ?? "default"}`;
        this.encryptionKey = crypto4.scryptSync(seed, "mxclaw-vault-salt", 32);
      }
      /** Load the vault from disk. */
      async load() {
        try {
          const raw = await fs6.readFile(this.vaultPath, "utf-8");
          const decrypted = this.decrypt(raw);
          const parsed = JSON.parse(decrypted);
          this.vault = new Map(Object.entries(parsed));
        } catch {
          this.vault = /* @__PURE__ */ new Map();
        }
      }
      /** Save the vault to disk (encrypted). */
      async save() {
        const obj = Object.fromEntries(this.vault);
        const encrypted = this.encrypt(JSON.stringify(obj));
        await fs6.writeFile(this.vaultPath, encrypted, "utf-8");
      }
      /** Set a secret. */
      async set(key, value) {
        this.vault.set(key, value);
        await this.save();
      }
      /** Get a secret. */
      get(key) {
        return this.vault.get(key);
      }
      /** Delete a secret. */
      async delete(key) {
        const existed = this.vault.delete(key);
        if (existed)
          await this.save();
        return existed;
      }
      /** List all secret keys (not values). */
      listKeys() {
        return Array.from(this.vault.keys());
      }
      /** Check if a secret exists. */
      has(key) {
        return this.vault.has(key);
      }
      /**
       * Resolve a secret reference in config values.
       * Format: `$secret:KEY_NAME` → resolved value
       */
      resolve(value) {
        if (!value.startsWith("$secret:"))
          return value;
        const key = value.slice("$secret:".length);
        return this.vault.get(key) ?? value;
      }
      // ── Encryption helpers ─────────────────────────────────────────────
      encrypt(plaintext) {
        const iv = crypto4.randomBytes(16);
        const cipher = crypto4.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
      }
      decrypt(data) {
        const parts = data.split(":");
        if (parts.length !== 3)
          throw new Error("Invalid vault format");
        const iv = Buffer.from(parts[0], "hex");
        const tag = Buffer.from(parts[1], "hex");
        const encrypted = Buffer.from(parts[2], "hex");
        const decipher = crypto4.createDecipheriv("aes-256-gcm", this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final("utf-8");
      }
    };
  }
});

// packages/tools/dist/sandbox.js
var child_process, fs7, path7, os2, crypto5;
var init_sandbox = __esm({
  "packages/tools/dist/sandbox.js"() {
    "use strict";
    child_process = __toESM(require("node:child_process"), 1);
    fs7 = __toESM(require("node:fs"), 1);
    path7 = __toESM(require("node:path"), 1);
    os2 = __toESM(require("node:os"), 1);
    crypto5 = __toESM(require("node:crypto"), 1);
  }
});

// packages/tools/dist/image-gen.js
function mapSize(w, h) {
  if (w === 1792 && h === 1024)
    return "1792x1024";
  if (w === 1024 && h === 1792)
    return "1024x1792";
  if (w === 1024 && h === 1024)
    return "1024x1024";
  return "1024x1024";
}
var fs8, path8, crypto6, ImageGenParamsSchema, providers, imageGenTool;
var init_image_gen = __esm({
  "packages/tools/dist/image-gen.js"() {
    "use strict";
    init_zod();
    fs8 = __toESM(require("node:fs"), 1);
    path8 = __toESM(require("node:path"), 1);
    crypto6 = __toESM(require("node:crypto"), 1);
    ImageGenParamsSchema = external_exports.object({
      prompt: external_exports.string().min(1),
      negativePrompt: external_exports.string().optional(),
      width: external_exports.number().positive().default(1024),
      height: external_exports.number().positive().default(1024),
      steps: external_exports.number().positive().default(30),
      seed: external_exports.number().optional(),
      provider: external_exports.enum(["openai", "stability", "replicate", "local"]).default("openai"),
      style: external_exports.string().optional()
    });
    providers = {
      openai: {
        name: "OpenAI DALL-E",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: args.prompt,
              n: 1,
              size: mapSize(args.width, args.height),
              quality: "standard"
            })
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `DALL-E error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const data = await resp.json();
          return { url: data.data[0]?.url, base64: data.data[0]?.b64_json };
        }
      },
      stability: {
        name: "Stability AI",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
            body: (() => {
              const fd = new FormData();
              fd.append("prompt", args.prompt);
              if (args.negativePrompt)
                fd.append("negative_prompt", args.negativePrompt);
              fd.append("output_format", "png");
              return fd;
            })()
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `Stability error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const data = await resp.json();
          return { base64: data.image };
        }
      },
      replicate: {
        name: "Replicate (Stable Diffusion)",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.replicate.com/v1/models/stability-ai/sdxl/predictions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                prompt: args.prompt,
                negative_prompt: args.negativePrompt ?? "",
                width: args.width,
                height: args.height,
                num_inference_steps: args.steps,
                seed: args.seed
              }
            })
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `Replicate error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const prediction = await resp.json();
          let result = prediction;
          for (let i = 0; i < 30; i++) {
            if (result.status === "succeeded" || result.status === "failed")
              break;
            await new Promise((r) => setTimeout(r, 2e3));
            const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
              headers: { Authorization: `Bearer ${apiKey}` }
            });
            result = await pollResp.json();
          }
          if (result.status === "succeeded" && result.output?.[0]) {
            return { url: result.output[0] };
          }
          return { error: `Replicate generation ${result.status}` };
        }
      },
      local: {
        name: "Local (Stable Diffusion WebUI)",
        generate: async (args, _apiKey) => {
          const baseUrl = process.env.SD_WEBUI_URL ?? "http://localhost:7860";
          try {
            const resp = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: args.prompt,
                negative_prompt: args.negativePrompt ?? "",
                width: args.width,
                height: args.height,
                steps: args.steps,
                seed: args.seed ?? -1
              })
            });
            if (!resp.ok)
              return { error: `SD WebUI error [${resp.status}]` };
            const data = await resp.json();
            return { base64: data.images[0] };
          } catch (err) {
            return { error: `SD WebUI not reachable at ${baseUrl}` };
          }
        }
      }
    };
    imageGenTool = {
      name: "image_gen",
      description: "Generate images using AI (DALL-E 3, Stable Diffusion, Replicate, or local SD WebUI). Specify provider: openai, stability, replicate, or local.",
      parameters: ImageGenParamsSchema,
      execute: async (args, context) => {
        const parsed = ImageGenParamsSchema.parse(args);
        const provider = providers[parsed.provider];
        if (!provider) {
          return { success: false, output: "", error: `Unknown provider: ${parsed.provider}. Use: openai, stability, replicate, or local` };
        }
        const apiKey = parsed.provider === "openai" ? process.env.OPENAI_API_KEY ?? "" : parsed.provider === "stability" ? process.env.STABILITY_API_KEY ?? "" : parsed.provider === "replicate" ? process.env.REPLICATE_API_TOKEN ?? "" : "";
        if (parsed.provider !== "local" && !apiKey) {
          return { success: false, output: "", error: `API key required for ${provider.name}. Set ${parsed.provider === "openai" ? "OPENAI_API_KEY" : parsed.provider === "stability" ? "STABILITY_API_KEY" : "REPLICATE_API_TOKEN"} env var.` };
        }
        const result = await provider.generate(parsed, apiKey);
        if (result.error) {
          return { success: false, output: "", error: result.error };
        }
        const imageDir = path8.join(context.workspacePath, "images");
        fs8.mkdirSync(imageDir, { recursive: true });
        const imageId = crypto6.randomUUID();
        const imagePath = path8.join(imageDir, `${imageId}.png`);
        if (result.base64) {
          fs8.writeFileSync(imagePath, Buffer.from(result.base64, "base64"));
        } else if (result.url) {
          const downloadResp = await fetch(result.url);
          const buffer = Buffer.from(await downloadResp.arrayBuffer());
          fs8.writeFileSync(imagePath, buffer);
        }
        return {
          success: true,
          output: `Image generated by ${provider.name}: "${parsed.prompt}" (${parsed.width}x${parsed.height})`,
          artifacts: [{ type: "image", url: `file://${imagePath}`, name: `${imageId}.png` }]
        };
      }
    };
  }
});

// packages/tools/dist/cron-persist.js
function parseCronNext(cronExpr) {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5)
    return Date.now() + 36e5;
  const now = /* @__PURE__ */ new Date();
  const minute = parts[0] ?? "*";
  const hour = parts[1] ?? "*";
  let next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);
  if (minute !== "*") {
    const m = parseInt(minute.replace("*/", ""), 10);
    if (minute.startsWith("*/")) {
      next.setMinutes(Math.ceil(next.getMinutes() / m) * m);
    } else {
      next.setMinutes(m);
    }
  } else {
    next.setMinutes(next.getMinutes() + 1);
  }
  if (hour !== "*") {
    next.setHours(parseInt(hour, 10));
  }
  if (next <= now) {
    next.setMinutes(next.getMinutes() + 1);
    if (next <= now)
      next.setHours(next.getHours() + 1);
  }
  return next.getTime();
}
var fs9, path9, crypto7, CronPersistence;
var init_cron_persist = __esm({
  "packages/tools/dist/cron-persist.js"() {
    "use strict";
    fs9 = __toESM(require("node:fs"), 1);
    path9 = __toESM(require("node:path"), 1);
    crypto7 = __toESM(require("node:crypto"), 1);
    CronPersistence = class {
      filePath;
      jobs = /* @__PURE__ */ new Map();
      timers = /* @__PURE__ */ new Map();
      constructor(workspacePath) {
        this.filePath = path9.join(workspacePath, "cron-jobs.json");
        this.load();
      }
      load() {
        try {
          if (fs9.existsSync(this.filePath)) {
            const data = JSON.parse(fs9.readFileSync(this.filePath, "utf-8"));
            for (const job of data) {
              this.jobs.set(job.id, job);
              if (job.enabled)
                this.scheduleJob(job);
            }
          }
        } catch (err) {
          console.error("[cron] Failed to load cron jobs:", err);
        }
      }
      save() {
        try {
          const dir = path9.dirname(this.filePath);
          if (!fs9.existsSync(dir))
            fs9.mkdirSync(dir, { recursive: true });
          const data = Array.from(this.jobs.values());
          fs9.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
          console.error("[cron] Failed to save cron jobs:", err);
        }
      }
      scheduleJob(job) {
        const existing = this.timers.get(job.id);
        if (existing)
          clearTimeout(existing);
        const delay = Math.max(0, job.nextRunAt - Date.now());
        const timer = setTimeout(() => {
          this.executeJob(job.id);
        }, delay);
        this.timers.set(job.id, timer);
      }
      async executeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.enabled)
          return;
        try {
          const { exec: exec3 } = await import("node:child_process");
          await new Promise((resolve3, reject) => {
            exec3(job.command, { timeout: 6e4, shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash" }, (error, stdout, stderr) => {
              if (error) {
                job.lastError = stderr || error.message;
                reject(error);
              } else {
                job.lastError = void 0;
                resolve3();
              }
            });
          });
          job.lastRunAt = Date.now();
        } catch (err) {
          job.lastError = err instanceof Error ? err.message : String(err);
        }
        job.nextRunAt = parseCronNext(job.schedule);
        this.jobs.set(jobId, job);
        this.save();
        this.scheduleJob(job);
      }
      addJob(name, schedule, command, agentId) {
        const id = crypto7.randomUUID();
        const job = {
          id,
          name,
          schedule,
          command,
          agentId,
          createdAt: Date.now(),
          nextRunAt: parseCronNext(schedule),
          enabled: true
        };
        this.jobs.set(id, job);
        this.save();
        this.scheduleJob(job);
        return job;
      }
      removeJob(id) {
        const timer = this.timers.get(id);
        if (timer)
          clearTimeout(timer);
        this.timers.delete(id);
        const deleted = this.jobs.delete(id);
        if (deleted)
          this.save();
        return deleted;
      }
      getJob(id) {
        return this.jobs.get(id);
      }
      listJobs() {
        return Array.from(this.jobs.values());
      }
      enableJob(id) {
        const job = this.jobs.get(id);
        if (!job)
          return false;
        job.enabled = true;
        this.jobs.set(id, job);
        this.save();
        this.scheduleJob(job);
        return true;
      }
      disableJob(id) {
        const job = this.jobs.get(id);
        if (!job)
          return false;
        job.enabled = false;
        this.jobs.set(id, job);
        this.save();
        const timer = this.timers.get(id);
        if (timer)
          clearTimeout(timer);
        this.timers.delete(id);
        return true;
      }
      shutdown() {
        for (const timer of this.timers.values()) {
          clearTimeout(timer);
        }
        this.timers.clear();
      }
    };
  }
});

// packages/tools/dist/web-search.js
async function searchDuckDuckGo(query, maxResults) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)"
    }
  });
  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }
  const html = await response.text();
  const results = [];
  const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const rawUrl = match[1];
    const title = stripHtml(match[2]).trim();
    const snippet = stripHtml(match[3]).trim();
    const realUrl = extractDdgUrl(rawUrl);
    if (title && realUrl) {
      results.push({ title, url: realUrl, snippet });
    }
  }
  if (results.length === 0) {
    const simpleRegex = /<a[^>]+class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = simpleRegex.exec(html)) !== null && results.length < maxResults) {
      const url2 = match[1];
      const title = stripHtml(match[2]).trim();
      if (url2 && title) {
        results.push({ title, url: url2, snippet: "" });
      }
    }
  }
  return results;
}
async function searchBrave(query, maxResults) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY not set. Set it in your environment or use duckduckgo backend.");
  }
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`Brave Search returned ${response.status}`);
  }
  const data = await response.json();
  return data.web?.results?.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description
  })) ?? [];
}
async function searchSearXNG(query, maxResults) {
  const baseUrl = process.env.SEARXNG_URL ?? "http://localhost:8888";
  const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SearXNG returned ${response.status}`);
  }
  const data = await response.json();
  return data.results?.slice(0, maxResults).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content
  })) ?? [];
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ");
}
function extractDdgUrl(redirectUrl) {
  try {
    const parsed = new URL(redirectUrl, "https://duckduckgo.com");
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : redirectUrl;
  } catch {
    return redirectUrl;
  }
}
var WebSearchParamsSchema, webSearchTool;
var init_web_search = __esm({
  "packages/tools/dist/web-search.js"() {
    "use strict";
    init_zod();
    WebSearchParamsSchema = external_exports.object({
      query: external_exports.string().min(1).describe("The search query"),
      maxResults: external_exports.number().min(1).max(20).default(5).describe("Number of results to return"),
      backend: external_exports.enum(["duckduckgo", "brave", "searxng"]).default("duckduckgo").describe("Search backend to use")
    });
    webSearchTool = {
      name: "web_search",
      description: "Search the web for information. Returns titles, URLs, and snippets. Use this when you need current information, facts, or links.",
      parameters: WebSearchParamsSchema,
      execute: async (args, _context) => {
        const { query, maxResults, backend } = WebSearchParamsSchema.parse(args);
        try {
          let results;
          switch (backend) {
            case "duckduckgo":
              results = await searchDuckDuckGo(query, maxResults);
              break;
            case "brave":
              results = await searchBrave(query, maxResults);
              break;
            case "searxng":
              results = await searchSearXNG(query, maxResults);
              break;
            default:
              results = await searchDuckDuckGo(query, maxResults);
          }
          if (results.length === 0) {
            return { success: true, output: `No results found for: "${query}"` };
          }
          const formatted = results.map((r, i) => `${i + 1}. **${r.title}**
   ${r.url}
   ${r.snippet}`).join("\n\n");
          return {
            success: true,
            output: `Search results for "${query}" (${results.length} results):

${formatted}`
          };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: `Search failed: ${err instanceof Error ? err.message : String(err)}`
          };
        }
      }
    };
  }
});

// packages/tools/dist/web-fetch.js
function htmlToReadableText(html, _selector) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
  text = text.replace(/<aside[\s\S]*?<\/aside>/gi, "");
  text = text.replace(/<[^>]+(?:hidden|display:\s*none|aria-hidden="true")[^>]*>[\s\S]*?<\/[^>]+>/gi, "");
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");
  text = text.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr\s*\/?>/gi, "\n---\n");
  text = text.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, "$1\n");
  text = text.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, " | $1");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();
  return text;
}
var WebFetchParamsSchema, webFetchTool;
var init_web_fetch = __esm({
  "packages/tools/dist/web-fetch.js"() {
    "use strict";
    init_zod();
    WebFetchParamsSchema = external_exports.object({
      url: external_exports.string().url().describe("The URL to fetch"),
      selector: external_exports.string().optional().describe("Optional CSS selector to extract specific content"),
      maxLength: external_exports.number().min(100).max(1e5).default(1e4).describe("Maximum characters of content to return"),
      timeout: external_exports.number().min(1e3).max(3e4).default(1e4).describe("Request timeout in milliseconds")
    });
    webFetchTool = {
      name: "web_fetch",
      description: "Fetch and read the content of a web page. Converts HTML to clean, readable text. Use this to read articles, documentation, or any web page content.",
      parameters: WebFetchParamsSchema,
      execute: async (args, _context) => {
        const { url, selector, maxLength, timeout } = WebFetchParamsSchema.parse(args);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)",
              Accept: "text/html, application/json, text/plain, */*"
            },
            signal: controller.signal,
            redirect: "follow"
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            return {
              success: false,
              output: "",
              error: `HTTP ${response.status}: ${response.statusText}`
            };
          }
          const contentType = response.headers.get("content-type") ?? "";
          const rawBody = await response.text();
          let content;
          if (contentType.includes("application/json")) {
            try {
              const parsed = JSON.parse(rawBody);
              content = JSON.stringify(parsed, null, 2);
            } catch {
              content = rawBody;
            }
          } else if (contentType.includes("text/plain")) {
            content = rawBody;
          } else {
            content = htmlToReadableText(rawBody, selector);
          }
          if (content.length > maxLength) {
            content = content.slice(0, maxLength) + "\n\n[...content truncated]";
          }
          return {
            success: true,
            output: `# Content from ${url}

${content}`
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("abort")) {
            return { success: false, output: "", error: `Request timed out after ${timeout}ms` };
          }
          return { success: false, output: "", error: `Fetch failed: ${msg}` };
        }
      }
    };
  }
});

// packages/tools/dist/index.js
function getCronStore(workspacePath) {
  if (!cronPersistence) {
    cronPersistence = new CronPersistence(workspacePath);
  }
  return cronPersistence;
}
function registerMemoryAdapter(adapter) {
  _memoryAdapter = adapter;
}
function getTool(name) {
  return ALL_TOOLS.find((t) => t.name === name);
}
function getToolDefinitionsForLLM(enabledTools) {
  return ALL_TOOLS.filter((t) => enabledTools.has(t.name)).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters)
    }
  }));
}
function zodToJsonSchema(schema) {
  function unwrap(s) {
    let inner = s;
    let isOptional = false;
    while (true) {
      if (inner instanceof external_exports.ZodDefault) {
        inner = inner._def.innerType;
      } else if (inner instanceof external_exports.ZodOptional) {
        inner = inner.unwrap();
        isOptional = true;
      } else if (inner instanceof external_exports.ZodNullable) {
        inner = inner.unwrap();
        isOptional = true;
      } else {
        break;
      }
    }
    return { inner, isOptional };
  }
  function fieldToSchema(field) {
    const { inner, isOptional } = unwrap(field);
    const fieldDef = {};
    if (inner instanceof external_exports.ZodString) {
      fieldDef.type = "string";
    } else if (inner instanceof external_exports.ZodNumber) {
      fieldDef.type = "number";
    } else if (inner instanceof external_exports.ZodBoolean) {
      fieldDef.type = "boolean";
    } else if (inner instanceof external_exports.ZodEnum) {
      fieldDef.type = "string";
      fieldDef.enum = inner.options;
    } else if (inner instanceof external_exports.ZodArray) {
      fieldDef.type = "array";
      fieldDef.items = fieldToSchema(inner.element).schema;
    } else if (inner instanceof external_exports.ZodObject) {
      fieldDef.type = "object";
      const objSchema = zodToJsonSchema(inner);
      fieldDef.properties = objSchema.properties;
      if (objSchema.required)
        fieldDef.required = objSchema.required;
    } else if (inner instanceof external_exports.ZodRecord) {
      fieldDef.type = "object";
      fieldDef.additionalProperties = true;
    } else {
      fieldDef.type = "string";
    }
    if (inner.description)
      fieldDef.description = inner.description;
    return { schema: fieldDef, optional: isOptional };
  }
  const shape = schema.shape;
  if (!shape)
    return { type: "object", properties: {} };
  const properties = {};
  const requiredFields = [];
  for (const [key, field] of Object.entries(shape)) {
    const { schema: fieldSchema, optional } = fieldToSchema(field);
    properties[key] = fieldSchema;
    if (!optional)
      requiredFields.push(key);
  }
  return {
    type: "object",
    properties,
    ...requiredFields.length > 0 ? { required: requiredFields } : {}
  };
}
function resolvePath(inputPath, workspacePath) {
  if (inputPath.startsWith("~")) {
    return path10.join(os3.homedir(), inputPath.slice(1));
  }
  if (path10.isAbsolute(inputPath))
    return inputPath;
  return path10.resolve(workspacePath, inputPath);
}
function isPathAllowed(resolved, workspacePath) {
  const normalized = path10.normalize(resolved);
  const workspaceNormalized = path10.normalize(workspacePath);
  return normalized.startsWith(workspaceNormalized);
}
var child_process2, fs10, path10, os3, crypto8, BashParamsSchema, bashTool, BrowserParamsSchema, browserTool, CanvasParamsSchema, canvasTool, CronParamsSchema, cronPersistence, cronTool, SessionSpawnParamsSchema, _sessionSpawnFn, sessionSpawnTool, FileReadParamsSchema, fileReadTool, FileWriteParamsSchema, fileWriteTool, MemoryParamsSchema, _memoryAdapter, memoryTool, ALL_TOOLS, ApprovalManager;
var init_dist5 = __esm({
  "packages/tools/dist/index.js"() {
    "use strict";
    init_zod();
    init_dist4();
    init_sandbox();
    init_image_gen();
    init_cron_persist();
    child_process2 = __toESM(require("node:child_process"), 1);
    fs10 = __toESM(require("node:fs"), 1);
    path10 = __toESM(require("node:path"), 1);
    os3 = __toESM(require("node:os"), 1);
    crypto8 = __toESM(require("node:crypto"), 1);
    init_image_gen();
    init_web_search();
    init_web_fetch();
    init_web_search();
    init_web_fetch();
    BashParamsSchema = external_exports.object({
      command: external_exports.string().min(1),
      workingDirectory: external_exports.string().optional(),
      timeout: external_exports.number().positive().default(3e4),
      env: external_exports.record(external_exports.string()).optional()
    });
    bashTool = {
      name: "bash",
      description: "Execute a shell command. Requires approval for dangerous operations.",
      parameters: BashParamsSchema,
      execute: async (args, context) => {
        const { command, workingDirectory, timeout, env } = BashParamsSchema.parse(args);
        const sandboxedCommand = context.sandbox?.enabled ? getSandboxCommand(context.sandbox, command) : command;
        return new Promise((resolve3) => {
          const proc = child_process2.exec(sandboxedCommand, {
            cwd: workingDirectory ?? context.workspacePath,
            timeout,
            env: { ...process.env, ...env },
            maxBuffer: 10 * 1024 * 1024,
            // 10MB
            shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash"
          }, (error, stdout, stderr) => {
            if (error) {
              resolve3({
                success: false,
                output: stderr || stdout || error.message,
                error: error.message
              });
            } else {
              resolve3({
                success: true,
                output: stdout || "(no output)"
              });
            }
          });
          if (context.signal) {
            context.signal.addEventListener("abort", () => {
              proc.kill();
              resolve3({ success: false, output: "", error: "Command timed out" });
            });
          }
        });
      }
    };
    BrowserParamsSchema = external_exports.object({
      action: external_exports.enum(["navigate", "click", "type", "screenshot", "evaluate", "getText", "wait"]),
      url: external_exports.string().optional(),
      selector: external_exports.string().optional(),
      text: external_exports.string().optional(),
      script: external_exports.string().optional(),
      timeout: external_exports.number().positive().default(1e4)
    });
    browserTool = {
      name: "browser",
      description: "Control a browser via Chrome DevTools Protocol. Requires a running Chrome with --remote-debugging-port.",
      parameters: BrowserParamsSchema,
      execute: async (args, _context) => {
        const { action, url, selector, text, script, timeout } = BrowserParamsSchema.parse(args);
        const cdpUrl = process.env.mxclaw_CDP_URL ?? "http://localhost:9222";
        try {
          const response = await fetch(`${cdpUrl}/json/version`);
          const debugInfo = await response.json();
          const wsUrl = debugInfo.webSocketDebuggerUrl;
          if (!wsUrl) {
            return { success: false, output: "", error: "No Chrome debugging instance found at " + cdpUrl };
          }
          const ws = new WebSocket(wsUrl);
          let msgId = 1;
          const pending = /* @__PURE__ */ new Map();
          await new Promise((resolveWs, rejectWs) => {
            ws.onopen = () => resolveWs();
            ws.onerror = (e) => rejectWs(new Error("WebSocket connection failed"));
            setTimeout(() => rejectWs(new Error("WebSocket connection timeout")), 5e3);
          });
          const sendCommand = (method, params) => {
            return new Promise((resolve3, reject) => {
              const id = msgId++;
              pending.set(id, { resolve: resolve3, reject });
              ws.send(JSON.stringify({ id, method, params }));
              setTimeout(() => {
                pending.delete(id);
                reject(new Error(`CDP command ${method} timed out`));
              }, timeout);
            });
          };
          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && pending.has(msg.id)) {
              const { resolve: resolve3, reject } = pending.get(msg.id);
              pending.delete(msg.id);
              if (msg.error)
                reject(new Error(msg.error.message));
              else
                resolve3(msg.result);
            }
          };
          let result = "";
          switch (action) {
            case "navigate": {
              if (!url)
                return { success: false, output: "", error: "URL required for navigate" };
              await sendCommand("Page.enable");
              await sendCommand("Page.navigate", { url });
              result = `Navigated to ${url}`;
              break;
            }
            case "screenshot": {
              const screenshot = await sendCommand("Page.captureScreenshot", { format: "png" });
              result = screenshot.data;
              break;
            }
            case "evaluate": {
              if (!script)
                return { success: false, output: "", error: "Script required for evaluate" };
              const evalResult = await sendCommand("Runtime.evaluate", {
                expression: script,
                returnByValue: true
              });
              result = JSON.stringify(evalResult);
              break;
            }
            case "click": {
              if (!selector)
                return { success: false, output: "", error: "Selector required for click" };
              const doc = await sendCommand("DOM.getDocument");
              const node = await sendCommand("DOM.querySelector", {
                nodeId: doc.root.nodeId,
                selector
              });
              const nodeId = node.nodeId;
              if (!nodeId)
                return { success: false, output: "", error: `Element not found: ${selector}` };
              const boxModel = await sendCommand("DOM.getBoxModel", { nodeId });
              const quad = boxModel.model.content;
              const x = quad[0] + (quad[4] - quad[0]) / 2;
              const y = quad[1] + (quad[5] - quad[1]) / 2;
              await sendCommand("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
              await sendCommand("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
              result = `Clicked ${selector}`;
              break;
            }
            case "type": {
              if (!selector || !text)
                return { success: false, output: "", error: "Selector and text required for type" };
              const doc = await sendCommand("DOM.getDocument");
              const node = await sendCommand("DOM.querySelector", {
                nodeId: doc.root.nodeId,
                selector
              });
              const nodeId = node.nodeId;
              if (!nodeId)
                return { success: false, output: "", error: `Element not found: ${selector}` };
              await sendCommand("DOM.focus", { nodeId });
              await sendCommand("Input.insertText", { text });
              result = `Typed "${text}" into ${selector}`;
              break;
            }
            case "getText": {
              if (!selector)
                return { success: false, output: "", error: "Selector required for getText" };
              const evalResult = await sendCommand("Runtime.evaluate", {
                expression: `document.querySelector('${selector.replace(/'/g, "\\'")}')?.textContent ?? ''`,
                returnByValue: true
              });
              result = JSON.stringify(evalResult);
              break;
            }
            case "wait": {
              await new Promise((r) => setTimeout(r, timeout));
              result = `Waited ${timeout}ms`;
              break;
            }
          }
          ws.close();
          return { success: true, output: result };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    CanvasParamsSchema = external_exports.object({
      action: external_exports.enum(["draw", "clear", "render", "update"]),
      json: external_exports.record(external_exports.unknown()).optional(),
      width: external_exports.number().positive().default(800),
      height: external_exports.number().positive().default(600)
    });
    canvasTool = {
      name: "canvas",
      description: "Draw on a shared canvas using A2UI JSON format. Rendered on connected clients.",
      parameters: CanvasParamsSchema,
      execute: async (args, context) => {
        const { action, json, width, height } = CanvasParamsSchema.parse(args);
        const canvasDir = path10.join(context.workspacePath, "canvas");
        fs10.mkdirSync(canvasDir, { recursive: true });
        const canvasFile = path10.join(canvasDir, `${context.sessionKey}.json`);
        switch (action) {
          case "draw": {
            const canvasState = {
              width,
              height,
              elements: json?.elements ?? [],
              version: Date.now()
            };
            fs10.writeFileSync(canvasFile, JSON.stringify(canvasState, null, 2));
            return {
              success: true,
              output: `Canvas updated with ${json?.elements?.length ?? 0} elements`,
              artifacts: [{ type: "canvas", url: `canvas://${context.sessionKey}`, name: "canvas-state" }]
            };
          }
          case "clear": {
            const emptyState = { width, height, elements: [], version: Date.now() };
            fs10.writeFileSync(canvasFile, JSON.stringify(emptyState, null, 2));
            return { success: true, output: "Canvas cleared" };
          }
          case "render": {
            if (!fs10.existsSync(canvasFile)) {
              return { success: true, output: JSON.stringify({ width, height, elements: [] }) };
            }
            const state = fs10.readFileSync(canvasFile, "utf-8");
            return { success: true, output: state };
          }
          case "update": {
            if (!fs10.existsSync(canvasFile)) {
              return { success: false, output: "", error: "No canvas state to update" };
            }
            const existing = JSON.parse(fs10.readFileSync(canvasFile, "utf-8"));
            const merged = { ...existing, ...json, version: Date.now() };
            fs10.writeFileSync(canvasFile, JSON.stringify(merged, null, 2));
            return { success: true, output: "Canvas updated" };
          }
          default:
            return { success: false, output: "", error: `Unknown canvas action: ${action}` };
        }
      }
    };
    CronParamsSchema = external_exports.object({
      action: external_exports.enum(["schedule", "list", "cancel"]),
      name: external_exports.string().optional(),
      schedule: external_exports.string().optional(),
      // cron expression
      command: external_exports.string().optional(),
      agentId: external_exports.string().optional()
    });
    cronPersistence = null;
    cronTool = {
      name: "cron",
      description: "Schedule recurring tasks using cron expressions. Jobs are persisted to disk and survive restarts.",
      parameters: CronParamsSchema,
      execute: async (args, context) => {
        const { action, name, schedule, command, agentId } = CronParamsSchema.parse(args);
        const store = getCronStore(context.workspacePath);
        switch (action) {
          case "schedule": {
            if (!name || !schedule || !command) {
              return { success: false, output: "", error: "name, schedule, and command required" };
            }
            const job = store.addJob(name, schedule, command, agentId ?? context.agentId);
            return { success: true, output: `Cron job "${name}" scheduled with ID ${job.id} (persisted to disk)` };
          }
          case "list": {
            const jobs = store.listJobs().map((j) => ({
              id: j.id,
              name: j.name,
              schedule: j.schedule,
              enabled: j.enabled,
              nextRunAt: new Date(j.nextRunAt).toISOString(),
              lastRunAt: j.lastRunAt ? new Date(j.lastRunAt).toISOString() : null,
              lastError: j.lastError ?? null
            }));
            return { success: true, output: JSON.stringify(jobs, null, 2) };
          }
          case "cancel": {
            if (!name)
              return { success: false, output: "", error: "name required" };
            const allJobs = store.listJobs();
            const job = allJobs.find((j) => j.name === name);
            if (job) {
              store.removeJob(job.id);
              return { success: true, output: `Cron job "${name}" cancelled and removed from disk` };
            }
            return { success: false, output: "", error: `Cron job "${name}" not found` };
          }
          default:
            return { success: false, output: "", error: `Unknown cron action: ${action}` };
        }
      }
    };
    SessionSpawnParamsSchema = external_exports.object({
      agentId: external_exports.string().describe("The agent ID to spawn the sub-session for"),
      message: external_exports.string().describe("The initial message / task for the spawned session"),
      context: external_exports.record(external_exports.unknown()).optional().describe("Optional context to pass from the parent session")
    });
    _sessionSpawnFn = null;
    sessionSpawnTool = {
      name: "session_spawn",
      description: "Spawn a new isolated agent session to handle a subtask. The spawned session runs independently and can use a different agent. Returns the session key for cross-session communication via sessions_send.",
      parameters: SessionSpawnParamsSchema,
      execute: async (args, context) => {
        const { agentId, message, context: spawnContext } = SessionSpawnParamsSchema.parse(args);
        if (!_sessionSpawnFn) {
          return {
            success: false,
            output: "",
            error: "Session spawn is not available \u2014 gateway session manager not connected"
          };
        }
        try {
          const result = await _sessionSpawnFn(context.sessionKey, agentId, message, spawnContext);
          return {
            success: true,
            output: JSON.stringify({
              sessionKey: result.sessionKey,
              agentId: result.agentId,
              message: `Sub-session spawned successfully. Use session key "${result.sessionKey}" to send follow-up messages.`
            })
          };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: `Failed to spawn session: ${err instanceof Error ? err.message : String(err)}`
          };
        }
      }
    };
    FileReadParamsSchema = external_exports.object({
      path: external_exports.string().min(1),
      encoding: external_exports.enum(["utf-8", "base64", "binary"]).default("utf-8"),
      maxBytes: external_exports.number().positive().default(1024 * 1024)
      // 1MB
    });
    fileReadTool = {
      name: "file_read",
      description: "Read a file from the workspace or allowed paths.",
      parameters: FileReadParamsSchema,
      execute: async (args, context) => {
        const { path: filePath, encoding, maxBytes } = FileReadParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
          return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        if (!fs10.existsSync(resolved)) {
          return { success: false, output: "", error: `File not found: ${filePath}` };
        }
        const stat = fs10.statSync(resolved);
        if (stat.size > maxBytes) {
          return { success: false, output: "", error: `File too large: ${stat.size} bytes (max ${maxBytes})` };
        }
        try {
          if (encoding === "utf-8") {
            const content = fs10.readFileSync(resolved, "utf-8");
            return { success: true, output: content };
          } else {
            const content = fs10.readFileSync(resolved);
            return { success: true, output: content.toString(encoding) };
          }
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    FileWriteParamsSchema = external_exports.object({
      path: external_exports.string().min(1),
      content: external_exports.string(),
      encoding: external_exports.enum(["utf-8", "base64", "binary"]).default("utf-8"),
      append: external_exports.boolean().default(false)
    });
    fileWriteTool = {
      name: "file_write",
      description: "Write content to a file in the workspace or allowed paths.",
      parameters: FileWriteParamsSchema,
      execute: async (args, context) => {
        const { path: filePath, content, encoding, append } = FileWriteParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
          return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        const dir = path10.dirname(resolved);
        fs10.mkdirSync(dir, { recursive: true });
        try {
          if (append) {
            fs10.appendFileSync(resolved, content, encoding);
          } else {
            fs10.writeFileSync(resolved, content, encoding);
          }
          return { success: true, output: `Written ${content.length} bytes to ${filePath}` };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    MemoryParamsSchema = external_exports.object({
      action: external_exports.enum(["store", "search", "recall", "forget", "list"]),
      content: external_exports.string().optional().describe("Content to store (for store action)"),
      type: external_exports.enum(["fact", "preference", "entity", "event", "instruction", "general"]).optional().describe("Memory type"),
      tags: external_exports.array(external_exports.string()).optional().describe("Tags for categorization"),
      id: external_exports.string().optional().describe("Memory ID (for recall, forget)"),
      query: external_exports.string().optional().describe("Search query (for search action)")
    });
    _memoryAdapter = null;
    memoryTool = {
      name: "memory",
      description: "Store, search, recall, or forget information in the agent's persistent knowledge base. Use this to remember facts, user preferences, entities, events, or instructions across sessions.",
      parameters: MemoryParamsSchema,
      execute: async (args) => {
        if (!_memoryAdapter) {
          return { success: false, output: "", error: "Memory system not available" };
        }
        const { action, content, type, tags, id, query } = MemoryParamsSchema.parse(args);
        try {
          switch (action) {
            case "store": {
              if (!content)
                return { success: false, output: "", error: "content required for store" };
              const entry = await _memoryAdapter.store({
                content,
                type: type ?? "general",
                tags: tags ?? []
              });
              return { success: true, output: JSON.stringify({ id: entry.id, type: entry.type, tags: entry.tags }) };
            }
            case "search": {
              if (!query)
                return { success: false, output: "", error: "query required for search" };
              const results = await _memoryAdapter.search({ query, type, limit: 10 });
              return { success: true, output: JSON.stringify(results, null, 2) };
            }
            case "recall": {
              if (!id)
                return { success: false, output: "", error: "id required for recall" };
              const entry = await _memoryAdapter.recall(id);
              if (!entry)
                return { success: false, output: "", error: `Memory not found: ${id}` };
              return { success: true, output: JSON.stringify(entry, null, 2) };
            }
            case "forget": {
              if (!id)
                return { success: false, output: "", error: "id required for forget" };
              const ok = await _memoryAdapter.forget(id);
              return ok ? { success: true, output: `Memory ${id} forgotten` } : { success: false, output: "", error: `Memory not found: ${id}` };
            }
            case "list": {
              const entries = await _memoryAdapter.list(type);
              return { success: true, output: JSON.stringify(entries, null, 2) };
            }
            default:
              return { success: false, output: "", error: `Unknown action: ${action}` };
          }
        } catch (err) {
          return { success: false, output: "", error: err instanceof Error ? err.message : String(err) };
        }
      }
    };
    ALL_TOOLS = [
      bashTool,
      browserTool,
      canvasTool,
      cronTool,
      sessionSpawnTool,
      imageGenTool,
      fileReadTool,
      fileWriteTool,
      webSearchTool,
      webFetchTool,
      memoryTool
    ];
    ApprovalManager = class {
      pending = /* @__PURE__ */ new Map();
      timeouts = /* @__PURE__ */ new Map();
      defaultTimeoutMs = 6e4;
      // 1 minute
      requestApproval(tool, args, agentId, sessionKey) {
        const id = crypto8.randomUUID();
        const approval = {
          id,
          tool,
          args,
          agentId,
          sessionKey,
          timestamp: Date.now(),
          status: "pending"
        };
        this.pending.set(id, approval);
        const timeout = setTimeout(() => {
          const existing = this.pending.get(id);
          if (existing && existing.status === "pending") {
            existing.status = "timed-out";
            this.pending.set(id, existing);
          }
          this.timeouts.delete(id);
        }, this.defaultTimeoutMs);
        this.timeouts.set(id, timeout);
        return approval;
      }
      resolveApproval(approvalId, approved) {
        const approval = this.pending.get(approvalId);
        if (!approval || approval.status !== "pending")
          return null;
        const timeout = this.timeouts.get(approvalId);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(approvalId);
        }
        approval.status = approved ? "approved" : "denied";
        this.pending.set(approvalId, approval);
        return approval;
      }
      getPendingApprovals() {
        return Array.from(this.pending.values()).filter((a) => a.status === "pending");
      }
      getApproval(id) {
        return this.pending.get(id);
      }
    };
  }
});

// packages/logging/dist/index.js
function createLogger(config) {
  return new ConsoleLogger(config);
}
var LEVEL_PRIORITY, ConsoleLogger;
var init_dist6 = __esm({
  "packages/logging/dist/index.js"() {
    "use strict";
    LEVEL_PRIORITY = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5
    };
    ConsoleLogger = class _ConsoleLogger {
      globalLevel;
      subsystemLevels;
      prefix;
      constructor(config, prefix = "") {
        this.globalLevel = config.level;
        this.subsystemLevels = config.subsystems ?? {};
        this.prefix = prefix;
      }
      shouldLog(subsystem, level) {
        const effectiveLevel = this.subsystemLevels[subsystem] ?? this.globalLevel;
        return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[effectiveLevel];
      }
      log(level, subsystem, message, ...args) {
        if (!this.shouldLog(subsystem, level))
          return;
        const tag = this.prefix ? `[${this.prefix}:${subsystem}]` : `[${subsystem}]`;
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        const line = `${ts} ${level.toUpperCase()} ${tag} ${message}`;
        switch (level) {
          case "error":
            console.error(line, ...args);
            break;
          case "warn":
            console.warn(line, ...args);
            break;
          case "info":
            console.info(line, ...args);
            break;
          case "debug":
            console.debug(line, ...args);
            break;
          case "trace":
            console.trace(line, ...args);
            break;
        }
      }
      error(subsystem, message, ...args) {
        this.log("error", subsystem, message, ...args);
      }
      warn(subsystem, message, ...args) {
        this.log("warn", subsystem, message, ...args);
      }
      info(subsystem, message, ...args) {
        this.log("info", subsystem, message, ...args);
      }
      debug(subsystem, message, ...args) {
        this.log("debug", subsystem, message, ...args);
      }
      trace(subsystem, message, ...args) {
        this.log("trace", subsystem, message, ...args);
      }
      child(subsystem) {
        return new _ConsoleLogger({ level: this.globalLevel, subsystems: this.subsystemLevels, otel: { enabled: false, headers: {} } }, this.prefix ? `${this.prefix}:${subsystem}` : subsystem);
      }
    };
  }
});

// packages/voice/dist/index.js
var crypto9, VoiceManager;
var init_dist7 = __esm({
  "packages/voice/dist/index.js"() {
    "use strict";
    crypto9 = __toESM(require("node:crypto"), 1);
    VoiceManager = class {
      plugins = /* @__PURE__ */ new Map();
      activeSessions = /* @__PURE__ */ new Map();
      // sessionId -> provider
      register(plugin) {
        this.plugins.set(plugin.manifest.name, plugin);
      }
      async initialize(config) {
        const provider = config.defaultProvider;
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Voice provider "${provider}" not registered`);
        const providerConfig = config[provider] ?? {};
        await plugin.initialize(providerConfig);
      }
      async startVoiceSession(provider) {
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Voice provider "${provider}" not found`);
        const { sessionId } = await plugin.startSession();
        this.activeSessions.set(sessionId, provider);
        return sessionId;
      }
      async sendAudio(sessionId, audio) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Provider not found: ${provider}`);
        await plugin.sendAudio(sessionId, audio);
      }
      async *receiveAudio(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Provider not found: ${provider}`);
        yield* plugin.receiveAudio(sessionId);
      }
      async stopSession(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          return;
        const plugin = this.plugins.get(provider);
        if (plugin)
          await plugin.stopSession(sessionId);
        this.activeSessions.delete(sessionId);
      }
      getActiveSessions() {
        return Array.from(this.activeSessions.keys());
      }
    };
  }
});

// packages/skills/dist/index.js
function parseSkillMd(raw, fallbackName) {
  const frontmatter = {};
  let promptContent = raw;
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (fmMatch && fmMatch[1] && fmMatch[2]) {
    const fmBlock = fmMatch[1];
    promptContent = fmMatch[2].trim();
    for (const line of fmBlock.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#"))
        continue;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1)
        continue;
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();
      switch (key) {
        case "name":
          frontmatter.name = stripQuotes(value);
          break;
        case "description":
          frontmatter.description = stripQuotes(value);
          break;
        case "triggers":
          frontmatter.triggers = parseArrayValue(value);
          break;
        case "tools":
          frontmatter.tools = parseArrayValue(value);
          break;
        case "enabled":
          frontmatter.enabled = value === "true" || value === "yes";
          break;
      }
    }
  }
  return {
    name: frontmatter.name ?? fallbackName,
    description: frontmatter.description ?? "",
    triggers: frontmatter.triggers ?? [],
    tools: frontmatter.tools ?? [],
    promptContent,
    filePath: "",
    enabled: frontmatter.enabled ?? true
  };
}
function stripQuotes(s) {
  if (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1);
  }
  return s;
}
function parseArrayValue(value) {
  const cleaned = value.replace(/^\[/, "").replace(/\]$/, "");
  return cleaned.split(",").map((s) => stripQuotes(s.trim())).filter(Boolean);
}
var fs11, path11, SkillLoader;
var init_dist8 = __esm({
  "packages/skills/dist/index.js"() {
    "use strict";
    fs11 = __toESM(require("node:fs/promises"), 1);
    path11 = __toESM(require("node:path"), 1);
    init_dist6();
    SkillLoader = class {
      skills = /* @__PURE__ */ new Map();
      logger;
      skillsDir;
      constructor(workspacePath, logger) {
        this.logger = logger;
        this.skillsDir = path11.join(workspacePath, "skills");
      }
      /**
       * Scan the skills directory and load all SKILL.md files.
       */
      async loadAll() {
        this.skills.clear();
        try {
          await fs11.access(this.skillsDir);
        } catch {
          this.logger.debug("skills", `Skills directory not found: ${this.skillsDir}`);
          return [];
        }
        const entries = await fs11.readdir(this.skillsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory())
            continue;
          const skillMdPath = path11.join(this.skillsDir, entry.name, "SKILL.md");
          try {
            const raw = await fs11.readFile(skillMdPath, "utf-8");
            const skill = parseSkillMd(raw, entry.name);
            skill.filePath = skillMdPath;
            this.skills.set(skill.name, skill);
            this.logger.info("skills", `Loaded skill: ${skill.name} (${skill.triggers.length} triggers)`);
          } catch {
            this.logger.debug("skills", `No SKILL.md in ${entry.name}, skipping`);
          }
        }
        return Array.from(this.skills.values());
      }
      /**
       * Get a specific skill by name.
       */
      getSkill(name) {
        return this.skills.get(name);
      }
      /**
       * Get all loaded skills.
       */
      getAllSkills() {
        return Array.from(this.skills.values());
      }
      /**
       * Get enabled skills only.
       */
      getEnabledSkills() {
        return this.getAllSkills().filter((s) => s.enabled);
      }
      /**
       * Check if any skill triggers match the given message.
       * Returns the first matching skill, or null.
       */
      matchTrigger(message) {
        const lower = message.toLowerCase();
        for (const skill of this.getEnabledSkills()) {
          for (const trigger of skill.triggers) {
            if (lower.includes(trigger.toLowerCase())) {
              return skill;
            }
          }
        }
        return null;
      }
      /**
       * Build the combined skills prompt to inject into the agent's system context.
       * Only includes enabled skills.
       */
      buildSkillsPrompt() {
        const enabled = this.getEnabledSkills();
        if (enabled.length === 0)
          return "";
        const sections = enabled.map((s) => `## Skill: ${s.name}
${s.description ? `> ${s.description}
` : ""}${s.promptContent}`);
        return `

# Available Skills

${sections.join("\n\n---\n\n")}`;
      }
    };
  }
});

// packages/memory/dist/index.js
var fs12, fsSync3, path12, crypto10, InMemoryMemoryAdapter;
var init_dist9 = __esm({
  "packages/memory/dist/index.js"() {
    "use strict";
    fs12 = __toESM(require("node:fs/promises"), 1);
    fsSync3 = __toESM(require("node:fs"), 1);
    path12 = __toESM(require("node:path"), 1);
    crypto10 = __toESM(require("node:crypto"), 1);
    InMemoryMemoryAdapter = class {
      entries = /* @__PURE__ */ new Map();
      persistPath;
      dirty = false;
      constructor(persistPath) {
        this.persistPath = persistPath;
      }
      async load() {
        if (!this.persistPath)
          return;
        try {
          const raw = await fs12.readFile(this.persistPath, "utf-8");
          const lines = raw.trim().split("\n").filter(Boolean);
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              this.entries.set(entry.id, entry);
            } catch {
            }
          }
        } catch {
        }
      }
      async persist() {
        if (!this.dirty || !this.persistPath)
          return;
        const dir = path12.dirname(this.persistPath);
        fsSync3.mkdirSync(dir, { recursive: true });
        const lines = Array.from(this.entries.values()).map((e) => JSON.stringify(e)).join("\n");
        await fs12.writeFile(this.persistPath, lines + "\n", "utf-8");
        this.dirty = false;
      }
      async store(entry) {
        const id = crypto10.createHash("sha256").update(entry.content).digest("hex").slice(0, 16);
        const existing = this.entries.get(id);
        if (existing) {
          existing.content = entry.content;
          existing.tags = [.../* @__PURE__ */ new Set([...existing.tags, ...entry.tags])];
          existing.updatedAt = Date.now();
          existing.accessCount++;
          this.dirty = true;
          await this.persist();
          return existing;
        }
        const now = Date.now();
        const newEntry = {
          id,
          type: entry.type,
          content: entry.content,
          tags: entry.tags,
          embedding: entry.embedding,
          createdAt: now,
          updatedAt: now,
          accessCount: 0,
          source: entry.source
        };
        this.entries.set(id, newEntry);
        this.dirty = true;
        await this.persist();
        return newEntry;
      }
      async recall(id) {
        const entry = this.entries.get(id);
        if (!entry)
          return null;
        entry.accessCount++;
        entry.updatedAt = Date.now();
        this.dirty = true;
        await this.persist();
        return entry;
      }
      async search(query) {
        const { query: text, type, limit = 10 } = query;
        const entries = Array.from(this.entries.values());
        const filtered = type ? entries.filter((e) => e.type === type) : entries;
        if (!text) {
          return filtered.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
        }
        const queryLower = text.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(Boolean);
        const scored = [];
        for (const entry of filtered) {
          const contentLower = entry.content.toLowerCase();
          const tagsLower = entry.tags.map((t) => t.toLowerCase());
          let score = 0;
          for (const word of queryWords) {
            if (contentLower.includes(word))
              score += 1;
            if (tagsLower.some((t) => t.includes(word)))
              score += 2;
          }
          if (score > 0) {
            const recencyBonus = Math.max(0, 1 - (Date.now() - entry.updatedAt) / (7 * 24 * 36e5));
            const freqBonus = Math.min(entry.accessCount * 0.1, 1);
            score += recencyBonus + freqBonus;
            scored.push({ entry, score });
          }
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map((r) => r.entry);
      }
      async forget(id) {
        const deleted = this.entries.delete(id);
        if (deleted) {
          this.dirty = true;
          await this.persist();
        }
        return deleted;
      }
      async list(type) {
        const entries = Array.from(this.entries.values());
        const filtered = type ? entries.filter((e) => e.type === type) : entries;
        return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      async stats() {
        const byType = {};
        for (const entry of this.entries.values()) {
          byType[entry.type] = (byType[entry.type] ?? 0) + 1;
        }
        return { total: this.entries.size, byType };
      }
      buildMemoryPrompt(query, maxTokens = 2e3) {
        let entries;
        if (query) {
          entries = Array.from(this.entries.values()).filter((e) => {
            const q = query.toLowerCase();
            return e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q));
          }).slice(0, 20);
        } else {
          entries = Array.from(this.entries.values()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
        }
        if (entries.length === 0)
          return "";
        const lines = ["[MEMORY \u2014 Relevant stored knowledge:]"];
        let tokenEstimate = 10;
        for (const entry of entries) {
          const line = `- [${entry.type}] ${entry.content}${entry.tags.length ? ` (tags: ${entry.tags.join(", ")})` : ""}`;
          const lineTokens = Math.ceil(line.length / 4);
          if (tokenEstimate + lineTokens > maxTokens)
            break;
          lines.push(line);
          tokenEstimate += lineTokens;
        }
        return lines.join("\n");
      }
    };
  }
});

// packages/gateway/dist/context-engine.js
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
var ContextEngine;
var init_context_engine = __esm({
  "packages/gateway/dist/context-engine.js"() {
    "use strict";
    ContextEngine = class {
      logger;
      workspacePath;
      constructor(logger, workspacePath) {
        this.logger = logger;
        this.workspacePath = workspacePath;
      }
      /**
       * Build the complete message array for an LLM call.
       */
      async buildContext(opts) {
        const { agentConfig, turns, skillLoader, maxTokens } = opts;
        let systemPrompt = agentConfig.systemPrompt ?? agentConfig.model.systemPrompt ?? "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";
        const identityContent = await this.loadIdentityFiles();
        if (identityContent) {
          systemPrompt += `

${identityContent}`;
        }
        if (skillLoader) {
          const skillsPrompt = skillLoader.buildSkillsPrompt();
          if (skillsPrompt) {
            systemPrompt += skillsPrompt;
          }
        }
        const estimatedSystemTokens = estimateTokens(systemPrompt);
        const budget = maxTokens ?? 128e3;
        const responseReserve = 4096;
        const availableForHistory = budget - estimatedSystemTokens - responseReserve;
        const trimmedTurns = this.trimToTokenBudget(turns, availableForHistory);
        const messages = [
          { role: "system", content: systemPrompt },
          ...trimmedTurns.map((t) => ({
            role: t.role,
            content: t.content
          }))
        ];
        this.logger.debug("context", `Built context: ${estimatedSystemTokens} system tokens, ${trimmedTurns.length}/${turns.length} turns, budget: ${budget}`);
        return messages;
      }
      /**
       * Load AGENTS.md and SOUL.md from the workspace root.
       */
      async loadIdentityFiles() {
        const fs15 = await import("node:fs/promises");
        const path16 = await import("node:path");
        const parts = [];
        for (const filename of ["AGENTS.md", "SOUL.md", "INSTRUCTIONS.md"]) {
          const filePath = path16.join(this.workspacePath, filename);
          try {
            const content = await fs15.readFile(filePath, "utf-8");
            parts.push(`# ${filename}

${content.trim()}`);
          } catch {
          }
        }
        return parts.length > 0 ? parts.join("\n\n---\n\n") : null;
      }
      /**
       * Trim turns from the beginning until they fit within the token budget.
       * Always keeps the most recent turns.
       */
      trimToTokenBudget(turns, maxTokens) {
        if (turns.length === 0)
          return [];
        let totalTokens = 0;
        const result = [];
        for (let i = turns.length - 1; i >= 0; i--) {
          const turnTokens = estimateTokens(turns[i].content);
          if (totalTokens + turnTokens > maxTokens && result.length > 0) {
            break;
          }
          totalTokens += turnTokens;
          result.unshift(turns[i]);
        }
        return result;
      }
    };
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync: randomFillSync2 } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync2(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http4 = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes: randomBytes5, createHash: createHash6 } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket3 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket3, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket3.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket3.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket3.prototype.addEventListener = addEventListener;
    WebSocket3.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket3;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes5(16).toString("base64");
      const request = isSecure ? https.request : http4.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket3.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash6("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket3.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket3.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket3.CLOSED) return;
      if (websocket.readyState === WebSocket3.OPEN) {
        websocket._readyState = WebSocket3.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket3.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket3.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket3.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket3 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http4 = require("http");
    var { Duplex } = require("stream");
    var { createHash: createHash6 } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket3 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket3,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http4.createServer((req, res) => {
            const body = http4.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash6("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http4.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http4.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/.pnpm/ws@8.20.1/node_modules/ws/wrapper.mjs
var import_stream, import_extension, import_permessage_deflate, import_receiver, import_sender, import_subprotocol, import_websocket, import_websocket_server;
var init_wrapper = __esm({
  "node_modules/.pnpm/ws@8.20.1/node_modules/ws/wrapper.mjs"() {
    import_stream = __toESM(require_stream(), 1);
    import_extension = __toESM(require_extension(), 1);
    import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
    import_receiver = __toESM(require_receiver(), 1);
    import_sender = __toESM(require_sender(), 1);
    import_subprotocol = __toESM(require_subprotocol(), 1);
    import_websocket = __toESM(require_websocket(), 1);
    import_websocket_server = __toESM(require_websocket_server(), 1);
  }
});

// node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
var byteToHex;
var init_stringify = __esm({
  "node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/stringify.js"() {
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
  }
});

// node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/rng.js"() {
    import_crypto = require("crypto");
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/native.js
var import_crypto2, native_default;
var init_native = __esm({
  "node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/native.js"() {
    import_crypto2 = require("crypto");
    native_default = { randomUUID: import_crypto2.randomUUID };
  }
});

// node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/index.js
var init_esm = __esm({
  "node_modules/.pnpm/uuid@11.1.1/node_modules/uuid/dist/esm/index.js"() {
    init_v4();
  }
});

// packages/gateway/dist/webhook-verify.js
function verifyWebhook(platform, body, headers, secret) {
  const verifier = VERIFIERS[platform];
  if (!verifier)
    return false;
  return verifier(body, headers, secret);
}
var crypto11, VERIFIERS;
var init_webhook_verify = __esm({
  "packages/gateway/dist/webhook-verify.js"() {
    "use strict";
    crypto11 = __toESM(require("node:crypto"), 1);
    VERIFIERS = {
      // Discord: X-Signature-Ed25519 + X-Signature-Timestamp
      discord: (body, headers, publicKey) => {
        const signature = headers["x-signature-ed25519"];
        const timestamp = headers["x-signature-timestamp"];
        if (!signature || !timestamp)
          return false;
        try {
          const verified = crypto11.verify(null, Buffer.from(timestamp + body), publicKey, Buffer.from(signature, "hex"));
          return verified;
        } catch {
          return false;
        }
      },
      // Slack: X-Slack-Signature + X-Slack-Request-Timestamp
      slack: (body, headers, signingSecret) => {
        const signature = headers["x-slack-signature"];
        const timestamp = headers["x-slack-request-timestamp"];
        if (!signature || !timestamp)
          return false;
        const now = Math.floor(Date.now() / 1e3);
        if (Math.abs(now - parseInt(timestamp, 10)) > 300)
          return false;
        const sigBaseString = `v0:${timestamp}:${body}`;
        const computedSig = "v0=" + crypto11.createHmac("sha256", signingSecret).update(sigBaseString).digest("hex");
        const sigBuf = Buffer.from(signature);
        const compBuf = Buffer.from(computedSig);
        if (sigBuf.length !== compBuf.length)
          return false;
        return crypto11.timingSafeEqual(sigBuf, compBuf);
      },
      // Telegram: secret token in X-Telegram-Bot-Api-Secret-Token
      telegram: (_body, headers, secretToken) => {
        const token = headers["x-telegram-bot-api-secret-token"];
        return token === secretToken;
      },
      // LINE: X-Line-Signature
      line: (body, headers, channelSecret) => {
        const signature = headers["x-line-signature"];
        if (!signature)
          return false;
        const computed = crypto11.createHmac("sha256", channelSecret).update(body).digest("base64");
        return crypto11.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
      },
      // Feishu: timestamp + nonce + body + secret → SHA256
      feishu: (body, headers, secret) => {
        const timestamp = headers["x-lark-request-timestamp"] ?? headers["timestamp"];
        const nonce = headers["x-lark-request-nonce"] ?? headers["nonce"];
        const signature = headers["x-lark-signature"] ?? headers["signature"];
        if (!timestamp || !nonce || !signature)
          return false;
        const computed = crypto11.createHash("sha256").update(timestamp + nonce + secret + body).digest("hex");
        return crypto11.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
      },
      // Teams: HMAC-SHA256 of body with bot password
      teams: (body, headers, botPassword) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
          return false;
        const token = authHeader.slice(7);
        try {
          const parts = token.split(".");
          if (parts.length !== 3)
            return false;
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          return payload.serviceUrl?.includes("botframework.com");
        } catch {
          return false;
        }
      },
      // Google Chat: Bearer token — verify JWT claims (issuer + audience)
      googlechat: (_body, headers, projectNumber) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
          return false;
        const token = authHeader.slice(7);
        try {
          const parts = token.split(".");
          if (parts.length !== 3)
            return false;
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
          if (payload.iss !== "chat@system.gserviceaccount.com")
            return false;
          if (projectNumber && payload.aud !== projectNumber)
            return false;
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3))
            return false;
          return true;
        } catch {
          return false;
        }
      },
      // Generic: HMAC-SHA256
      generic: (body, headers, secret) => {
        const signature = headers["x-hub-signature-256"] ?? headers["x-signature"];
        if (!signature)
          return false;
        const algo = signature.startsWith("sha256=") ? "sha256" : "sha256";
        const computed = crypto11.createHmac(algo, secret).update(body).digest("hex");
        const expected = signature.replace(/^sha256=/, "");
        try {
          return crypto11.timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
        } catch {
          return false;
        }
      }
    };
  }
});

// packages/gateway/dist/utils.js
function readBody(req) {
  return new Promise((resolve3, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve3(body));
    req.on("error", reject);
  });
}
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
function redactConfig(config) {
  if (config === null || config === void 0)
    return config;
  if (typeof config === "string")
    return config;
  if (typeof config !== "object")
    return config;
  if (Array.isArray(config))
    return config.map(redactConfig);
  const result = {};
  for (const [key, value] of Object.entries(config)) {
    if (SENSITIVE_KEYS.has(key) && typeof value === "string" && value.length > 0) {
      result[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redactConfig(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
function buildCorsHeaders(corsOrigins, requestOrigin) {
  let allowedOrigin;
  if (corsOrigins.length === 0) {
    allowedOrigin = "*";
  } else if (corsOrigins.includes("*")) {
    allowedOrigin = "*";
  } else if (corsOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else {
    allowedOrigin = corsOrigins[0] ?? "*";
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1e3) {
  let lastError = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1e3;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}
var http, SENSITIVE_KEYS;
var init_utils = __esm({
  "packages/gateway/dist/utils.js"() {
    "use strict";
    http = __toESM(require("node:http"), 1);
    SENSITIVE_KEYS = /* @__PURE__ */ new Set([
      "token",
      "apiKey",
      "api_key",
      "secret",
      "password",
      "webhookSecret",
      "signingSecret",
      "botPassword",
      "apiToken"
    ]);
  }
});

// packages/gateway/dist/model-catalog.js
var model_catalog_exports = {};
__export(model_catalog_exports, {
  getAllModels: () => getAllModels,
  getModel: () => getModel,
  getModelsByProvider: () => getModelsByProvider,
  getModelsForProvider: () => getModelsForProvider,
  recommendModel: () => recommendModel
});
function getAllModels() {
  return [...CATALOG];
}
function getModelsForProvider(provider) {
  return CATALOG.filter((m) => m.provider === provider);
}
function getModel(modelId) {
  return CATALOG.find((m) => m.id === modelId);
}
function recommendModel(requirements) {
  return CATALOG.filter((m) => {
    if (requirements.needsVision && !m.supportsVision)
      return false;
    if (requirements.needsTools && !m.supportsTools)
      return false;
    if (requirements.minContext && m.contextWindow < requirements.minContext)
      return false;
    if (requirements.maxPricePer1M && m.pricing && m.pricing.inputPer1M > requirements.maxPricePer1M)
      return false;
    return true;
  }).sort((a, b) => (a.pricing?.inputPer1M ?? Infinity) - (b.pricing?.inputPer1M ?? Infinity))[0];
}
function getModelsByProvider() {
  const grouped = {};
  for (const model of CATALOG) {
    if (!grouped[model.provider])
      grouped[model.provider] = [];
    grouped[model.provider].push(model);
  }
  return grouped;
}
var CATALOG;
var init_model_catalog = __esm({
  "packages/gateway/dist/model-catalog.js"() {
    "use strict";
    CATALOG = [
      // OpenAI
      { id: "gpt-4.1", provider: "openai", displayName: "GPT-4.1", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 8 }, releaseDate: "2025-04" },
      { id: "gpt-4.1-mini", provider: "openai", displayName: "GPT-4.1 Mini", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.4, outputPer1M: 1.6 }, releaseDate: "2025-04" },
      { id: "gpt-4.1-nano", provider: "openai", displayName: "GPT-4.1 Nano", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.1, outputPer1M: 0.4 }, releaseDate: "2025-04" },
      { id: "gpt-4o", provider: "openai", displayName: "GPT-4o", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 } },
      { id: "gpt-4o-mini", provider: "openai", displayName: "GPT-4o Mini", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
      { id: "o3", provider: "openai", displayName: "o3", contextWindow: 2e5, maxOutput: 1e5, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 10, outputPer1M: 40 }, releaseDate: "2025-04" },
      { id: "o4-mini", provider: "openai", displayName: "o4-mini", contextWindow: 2e5, maxOutput: 1e5, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.1, outputPer1M: 4.4 }, releaseDate: "2025-04" },
      // Anthropic
      { id: "claude-opus-4-20250514", provider: "anthropic", displayName: "Claude Opus 4", contextWindow: 2e5, maxOutput: 32e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 15, outputPer1M: 75 }, releaseDate: "2025-05" },
      { id: "claude-sonnet-4-20250514", provider: "anthropic", displayName: "Claude Sonnet 4", contextWindow: 2e5, maxOutput: 64e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 }, releaseDate: "2025-05" },
      { id: "claude-haiku-4-5-20251001", provider: "anthropic", displayName: "Claude Haiku 4.5", contextWindow: 2e5, maxOutput: 8192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.8, outputPer1M: 4 }, releaseDate: "2025-10" },
      // Google
      { id: "gemini-2.5-pro", provider: "gemini", displayName: "Gemini 2.5 Pro", contextWindow: 1e6, maxOutput: 65536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.25, outputPer1M: 10 } },
      { id: "gemini-2.5-flash", provider: "gemini", displayName: "Gemini 2.5 Flash", contextWindow: 1e6, maxOutput: 65536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
      // DeepSeek
      { id: "deepseek-chat", provider: "deepseek", displayName: "DeepSeek V3", contextWindow: 64e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.27, outputPer1M: 1.1 } },
      { id: "deepseek-reasoner", provider: "deepseek", displayName: "DeepSeek R1", contextWindow: 64e3, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 0.55, outputPer1M: 2.19 } },
      // Groq
      { id: "llama-3.3-70b-versatile", provider: "groq", displayName: "Llama 3.3 70B", contextWindow: 128e3, maxOutput: 32768, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.59, outputPer1M: 0.79 } },
      { id: "llama-4-scout-17b-16e-instruct", provider: "groq", displayName: "Llama 4 Scout 17B", contextWindow: 131072, maxOutput: 8192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.11, outputPer1M: 0.34 }, releaseDate: "2025-04" },
      // Mistral
      { id: "mistral-large-latest", provider: "mistral", displayName: "Mistral Large", contextWindow: 128e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 6 } },
      // Cohere
      { id: "command-a", provider: "cohere", displayName: "Command A", contextWindow: 256e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 }, releaseDate: "2025-03" },
      // xAI
      { id: "grok-3", provider: "xai", displayName: "Grok 3", contextWindow: 131072, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 } },
      // Perplexity
      { id: "sonar-pro", provider: "perplexity", displayName: "Sonar Pro", contextWindow: 2e5, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 3, outputPer1M: 15 } },
      // Requesty (router — model list varies by user's enabled models)
      { id: "gpt-4o", provider: "requesty", displayName: "GPT-4o (via Requesty)", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      { id: "claude-sonnet-4-20250514", provider: "requesty", displayName: "Claude Sonnet 4 (via Requesty)", contextWindow: 2e5, maxOutput: 64e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      // Hugging Face
      { id: "meta-llama/Llama-3.3-70B-Instruct", provider: "huggingface", displayName: "Llama 3.3 70B Instruct", contextWindow: 128e3, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      { id: "Qwen/Qwen2.5-72B-Instruct", provider: "huggingface", displayName: "Qwen 2.5 72B Instruct", contextWindow: 131072, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", provider: "huggingface", displayName: "Mistral 7B Instruct", contextWindow: 32768, maxOutput: 4096, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      // Local
      { id: "any", provider: "ollama", displayName: "Ollama (Local)", contextWindow: 128e3, maxOutput: 4096, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      { id: "any", provider: "lmstudio", displayName: "LM Studio (Local)", contextWindow: 128e3, maxOutput: 4096, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true }
    ];
  }
});

// packages/gateway/dist/http-handler.js
function generateApiToken() {
  return `mxclaw_${crypto12.randomBytes(32).toString("base64url")}`;
}
function verifyApiAuth(req, config) {
  const configuredToken = config.gateway.apiToken;
  if (!configuredToken)
    return true;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return false;
  const provided = authHeader.slice(7);
  try {
    return crypto12.timingSafeEqual(Buffer.from(provided), Buffer.from(configuredToken));
  } catch {
    return false;
  }
}
async function handleHttpRequest(ctx, req, res) {
  const corsOrigins = ctx.config.gateway.corsOrigins ?? ["*"];
  const origin = req.headers.origin ?? "";
  const cors = buildCorsHeaders(corsOrigins, origin);
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  const rateCheck = ctx.rateLimiter.check(clientIp);
  if (!rateCheck.allowed) {
    res.writeHead(429, {
      ...cors,
      "Retry-After": "60",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1e3) + 60)
    });
    res.end(JSON.stringify({ error: "Too many requests", remaining: rateCheck.remaining }));
    return;
  }
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  try {
    if (url.pathname === "/health") {
      return sendJson(res, cors, 200, { status: "ok", uptime: Date.now() - ctx.startTime, version: "0.2.0" });
    }
    if (url.pathname.startsWith(ctx.config.gateway.webhookPath)) {
      await handleWebhook(ctx, req, res, url, cors);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      if (!verifyApiAuth(req, ctx.config)) {
        res.writeHead(401, { ...cors, "Content-Type": "application/json", "WWW-Authenticate": "Bearer" });
        res.end(JSON.stringify({ error: "Unauthorized \u2014 provide a valid Bearer token in the Authorization header" }));
        return;
      }
    }
    switch (url.pathname) {
      case "/status":
        return sendJson(res, cors, 200, await getGatewayStatus(ctx));
      case "/api/config":
        return await handleConfig(ctx, req, res, cors);
      case "/api/sessions":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return await handleListSessions(ctx, res, url, cors);
      case "/api/session/transcript":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return await handleTranscript(ctx, res, url, cors);
      case "/api/session/reset":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleSessionReset(ctx, req, res, cors);
      case "/api/approvals":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return sendJson(res, cors, 200, ctx.approvalManager.getPendingApprovals());
      case "/api/approval/resolve":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleApprovalResolve(ctx, req, res, cors);
      case "/api/pairing/generate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handlePairingGenerate(req, res, cors);
      case "/api/pairing/validate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handlePairingValidate(req, res, cors);
      case "/api/devices/pair":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleDevicePair(req, res, cors);
      case "/api/chat/send":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleChatSend(ctx, req, res, cors);
      case "/api/skills":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return handleListSkills(ctx, res, cors);
      case "/api/skills/toggle":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleToggleSkill(ctx, req, res, cors);
      case "/api/models":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return handleListModels(res, cors);
      case "/api/token/generate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return sendJson(res, cors, 200, { token: generateApiToken() });
      case "/api/memory":
        if (req.method === "GET")
          return await handleMemoryList(ctx, res, url, cors);
        if (req.method === "POST")
          return await handleMemoryStore(ctx, req, res, cors);
        return sendMethodNotAllowed(res, cors, "GET, POST");
      default:
        if (url.pathname.startsWith("/api/memory/")) {
          if (req.method === "GET")
            return await handleMemoryRecall(ctx, res, url, cors);
          if (req.method === "PUT")
            return await handleMemoryUpdate(ctx, req, res, cors);
          if (req.method === "DELETE")
            return await handleMemoryForget(ctx, res, url, cors);
          return sendMethodNotAllowed(res, cors, "GET, PUT, DELETE");
        }
        res.writeHead(404, cors);
        res.end(JSON.stringify({ error: "Not found" }));
    }
  } catch (err) {
    ctx.logger.error("http", "Request error", err);
    res.writeHead(500, cors);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
async function handleConfig(ctx, req, res, cors) {
  if (req.method === "GET") {
    sendJson(res, cors, 200, redactConfig(ctx.config));
  } else if (req.method === "PUT") {
    const body = await readBody(req);
    try {
      const parsed = JSON.parse(body);
      const validated = MxClawConfigSchema.parse({ ...ctx.config, ...parsed });
      Object.assign(ctx.config, validated);
      sendJson(res, cors, 200, { ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid config";
      sendJson(res, cors, 400, { error: msg });
    }
  } else {
    sendMethodNotAllowed(res, cors, "GET, PUT");
  }
}
async function handleListSessions(ctx, res, url, cors) {
  const agentId = url.searchParams.get("agentId") ?? ctx.config.defaultAgentId ?? "default";
  const sessions = await ctx.storage.listSessions(agentId);
  sendJson(res, cors, 200, sessions);
}
async function handleTranscript(ctx, res, url, cors) {
  const agentId = url.searchParams.get("agentId") ?? "default";
  const sessionKey = url.searchParams.get("sessionKey");
  if (!sessionKey) {
    sendJson(res, cors, 400, { error: "sessionKey required" });
    return;
  }
  const turns = await ctx.storage.getSessionTranscript(agentId, sessionKey);
  sendJson(res, cors, 200, turns);
}
async function handleSessionReset(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { agentId, sessionKey } = parsed;
  if (!sessionKey)
    return sendJson(res, cors, 400, { error: "sessionKey required" });
  await ctx.storage.deleteSession(agentId ?? "default", sessionKey);
  sendJson(res, cors, 200, { ok: true });
}
async function handleApprovalResolve(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { approvalId, approved } = parsed;
  if (!approvalId)
    return sendJson(res, cors, 400, { error: "approvalId required" });
  const result = ctx.approvalManager.resolveApproval(approvalId, approved ?? false);
  sendJson(res, cors, 200, result ?? { error: "Not found or already resolved" });
}
async function handlePairingGenerate(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { channelId, senderId } = parsed;
  if (!channelId || !senderId)
    return sendJson(res, cors, 400, { error: "channelId and senderId required" });
  const pairing = generatePairingCode(channelId, senderId);
  sendJson(res, cors, 200, pairing);
}
async function handlePairingValidate(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { code } = parsed;
  if (!code)
    return sendJson(res, cors, 400, { error: "code required" });
  const result = validatePairingCode(code);
  sendJson(res, cors, 200, result ? { valid: true, ...result } : { valid: false });
}
async function handleDevicePair(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { deviceId, deviceName } = parsed;
  if (!deviceId)
    return sendJson(res, cors, 400, { error: "deviceId required" });
  const session = pairDevice(deviceId, deviceName ?? "unknown");
  sendJson(res, cors, 200, { deviceId: session.deviceId, token: session.token });
}
async function handleChatSend(ctx, req, res, cors) {
  const body = await readBody(req);
  let envelope;
  try {
    envelope = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  envelope.id = envelope.id ?? v4_default();
  envelope.timestamp = envelope.timestamp ?? Date.now();
  await ctx.handleInboundMessage(envelope);
  sendJson(res, cors, 202, { accepted: true, messageId: envelope.id });
}
function handleListSkills(ctx, res, cors) {
  const skills = ctx.skillLoader?.getAllSkills() ?? [];
  sendJson(res, cors, 200, skills.map((s) => ({
    name: s.name,
    description: s.description,
    triggers: s.triggers,
    tools: s.tools,
    enabled: s.enabled,
    filePath: s.filePath
  })));
}
async function handleToggleSkill(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { name, enabled } = parsed;
  if (!name)
    return sendJson(res, cors, 400, { error: "name required" });
  const skill = ctx.skillLoader?.getSkill(name);
  if (!skill)
    return sendJson(res, cors, 404, { error: `Skill "${name}" not found` });
  skill.enabled = enabled ?? !skill.enabled;
  sendJson(res, cors, 200, { ok: true, name, enabled: skill.enabled });
}
function handleListModels(res, cors) {
  Promise.resolve().then(() => (init_model_catalog(), model_catalog_exports)).then(({ getAllModels: getAllModels2 }) => {
    sendJson(res, cors, 200, getAllModels2());
  }).catch(() => {
    sendJson(res, cors, 200, []);
  });
}
async function handleWebhook(ctx, req, res, url, cors) {
  const subPath = url.pathname.slice(ctx.config.gateway.webhookPath.length).replace(/^\//, "");
  const body = await readBody(req);
  ctx.logger.debug("webhook", `Incoming webhook: ${subPath}`);
  for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
    const webhookSecret = channelConfig.credentials?.webhookSecret;
    if (webhookSecret && subPath.includes(channelConfig.type)) {
      const headers = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string")
          headers[k] = v;
      }
      const platform = channelConfig.type;
      if (!verifyWebhook(platform, body, headers, webhookSecret)) {
        ctx.logger.warn("webhook", `Signature verification failed for ${channelId}`);
        res.writeHead(401, { ...cors, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid webhook signature" }));
        return;
      }
    }
    const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
    if (plugin?.handleCommand) {
      await plugin.handleCommand(channelId, "webhook", [subPath, body]);
    }
  }
  sendJson(res, cors, 200, { ok: true });
}
async function getGatewayStatus(ctx) {
  const channelStatuses = [];
  for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
    const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
    let status;
    if (plugin) {
      try {
        status = await plugin.getStatus(channelId);
      } catch {
        status = {
          id: channelId,
          type: channelConfig.type,
          connected: false,
          error: "Failed to get status",
          messageCount: ctx.channelMessageCounts.get(channelId) ?? 0,
          queueSize: ctx.outboundQueues.get(channelId)?.length ?? 0
        };
      }
    } else {
      status = {
        id: channelId,
        type: channelConfig.type,
        connected: false,
        error: "No plugin loaded",
        messageCount: 0,
        queueSize: 0
      };
    }
    channelStatuses.push(status);
  }
  const memUsage = process.memoryUsage();
  return {
    uptime: Date.now() - ctx.startTime,
    channels: channelStatuses,
    providers: Array.from(ctx.providerStatuses.values()),
    activeSessions: 0,
    deviceCount: 0,
    // Will be injected by the main gateway
    pluginErrors: ctx.registry.pluginErrors,
    memoryUsage: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss
    }
  };
}
async function handleMemoryList(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const type = url.searchParams.get("type");
  const entries = await ctx.memory.list(type ?? void 0);
  sendJson(res, cors, 200, entries);
}
async function handleMemoryStore(ctx, req, res, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON" });
  }
  if (!parsed.content)
    return sendJson(res, cors, 400, { error: "content required" });
  const entry = await ctx.memory.store({
    content: parsed.content,
    type: parsed.type ?? "general",
    tags: parsed.tags ?? [],
    source: parsed.source
  });
  sendJson(res, cors, 200, entry);
}
async function handleMemoryRecall(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = url.pathname.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const entry = await ctx.memory.recall(id);
  if (!entry)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  sendJson(res, cors, 200, entry);
}
async function handleMemoryUpdate(ctx, req, res, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = req.url?.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON" });
  }
  const existing = await ctx.memory.recall(id);
  if (!existing)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  const updated = await ctx.memory.store({
    content: parsed.content ?? existing.content,
    type: parsed.type ?? existing.type,
    tags: parsed.tags ?? existing.tags
  });
  sendJson(res, cors, 200, updated);
}
async function handleMemoryForget(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = url.pathname.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const ok = await ctx.memory.forget(id);
  if (!ok)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  sendJson(res, cors, 200, { ok: true });
}
function sendJson(res, cors, status, body) {
  res.writeHead(status, { ...cors, "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
function sendMethodNotAllowed(res, cors, allowed) {
  res.writeHead(405, { ...cors, "Allow": allowed, "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `Method not allowed. Allowed: ${allowed}` }));
}
var http2, crypto12;
var init_http_handler = __esm({
  "packages/gateway/dist/http-handler.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_rate_limiter();
    init_webhook_verify();
    init_dist4();
    init_dist5();
    http2 = __toESM(require("node:http"), 1);
    crypto12 = __toESM(require("node:crypto"), 1);
    init_esm();
    init_utils();
  }
});

// packages/gateway/dist/ws-handler.js
function isWsRateLimited(client, maxPerSecond) {
  const now = Date.now();
  client.msgTimestamps = client.msgTimestamps.filter((t) => now - t < 1e3);
  if (client.msgTimestamps.length >= maxPerSecond) {
    return true;
  }
  client.msgTimestamps.push(now);
  return false;
}
function handleWebSocketConnection(deps, ws) {
  let deviceId = null;
  let authenticated = false;
  const clientId = v4_default();
  const maxMsgsPerSecond = deps.wsRateLimit || 20;
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === import_websocket.default.OPEN) {
      ws.ping();
    }
  }, deps.wsHeartbeatIntervalMs);
  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      sendWs(ws, { type: "auth:error", error: "Authentication timeout \u2014 must authenticate within 10 seconds" });
      ws.close(4001, "Auth timeout");
    }
  }, 1e4);
  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "auth" && !authenticated) {
        const [devId, token] = msg.token.split(":");
        if (devId && token && validateDeviceToken(devId, token)) {
          authenticated = true;
          deviceId = devId;
          clearTimeout(authTimeout);
          deps.wsClients.set(clientId, { ws, deviceId: devId, clientId, msgTimestamps: [] });
          rotateDeviceToken(devId);
          sendWs(ws, { type: "auth:ok", deviceId: devId });
          deps.logger.info("ws", `Device authenticated: ${devId}`);
        } else {
          sendWs(ws, { type: "auth:error", error: "Invalid token" });
        }
        return;
      }
      if (!authenticated) {
        sendWs(ws, { type: "auth:error", error: "Not authenticated" });
        return;
      }
      const client = deps.wsClients.get(clientId);
      if (client && isWsRateLimited(client, maxMsgsPerSecond)) {
        sendWs(ws, { type: "error", message: "Rate limited \u2014 too many messages", code: "RATE_LIMITED" });
        return;
      }
      switch (msg.type) {
        case "chat:send": {
          const envelope = msg.envelope;
          if (envelope.sender.id !== deviceId && envelope.sender.id !== "owner") {
            sendWs(ws, { type: "error", message: "Sender ID mismatch \u2014 you cannot impersonate other users", code: "SENDER_MISMATCH" });
            break;
          }
          await deps.handleInboundMessage(envelope);
          break;
        }
        case "chat:approve":
          deps.approvalManager.resolveApproval(msg.approvalId, msg.approved);
          break;
        case "canvas:event":
          broadcastWs(deps.wsClients, { type: "canvas:update", json: msg.event });
          break;
        case "voice:start":
          try {
            const sessionId = await deps.voiceManager.startVoiceSession(deps.voiceDefaultProvider);
            sendWs(ws, { type: "voice:token", token: sessionId });
          } catch (err) {
            sendWs(ws, {
              type: "voice:error",
              error: err instanceof Error ? err.message : "Voice start failed"
            });
          }
          break;
        case "voice:stop":
          break;
        case "voice:audio":
          break;
        case "presence:update":
          broadcastWs(deps.wsClients, { type: "presence:update", deviceId, status: msg.status }, clientId);
          break;
        case "ping":
          sendWs(ws, { type: "pong" });
          break;
      }
    } catch (err) {
      deps.logger.error("ws", "Message handling error", err);
      sendWs(ws, { type: "error", message: "Invalid message", code: "PARSE_ERROR" });
    }
  });
  ws.on("close", (code) => {
    clearInterval(heartbeatInterval);
    clearTimeout(authTimeout);
    deps.wsClients.delete(clientId);
    if (deviceId) {
      broadcastWs(deps.wsClients, { type: "presence:update", deviceId, status: "offline" });
    }
    deps.logger.debug("ws", `Client disconnected: ${clientId} (code: ${code})`);
  });
  ws.on("error", (err) => {
    deps.logger.error("ws", "WebSocket error", err);
  });
}
function sendWs(ws, msg) {
  if (ws.readyState === import_websocket.default.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
function broadcastWs(clients, msg, excludeClientId) {
  for (const [id, client] of clients) {
    if (id !== excludeClientId) {
      sendWs(client.ws, msg);
    }
  }
}
var init_ws_handler = __esm({
  "packages/gateway/dist/ws-handler.js"() {
    "use strict";
    init_dist4();
    init_wrapper();
    init_esm();
  }
});

// packages/gateway/dist/agent-runner.js
async function runCompletion(deps, request, agentConfig) {
  const providers2 = [
    agentConfig.model,
    ...agentConfig.fallbackChain ?? []
  ];
  let lastError = null;
  for (const providerRef of providers2) {
    const plugin = getProviderPlugin(deps.registry, providerRef.provider);
    if (!plugin) {
      deps.logger.warn("llm", `Provider plugin not found: ${providerRef.provider}`);
      continue;
    }
    try {
      const response = await retryWithBackoff(async () => {
        return plugin.complete({
          ...request,
          model: providerRef.model,
          temperature: providerRef.temperature,
          maxTokens: providerRef.maxTokens
        });
      });
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: true,
        lastCheckAt: Date.now()
      });
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      deps.logger.warn("llm", `Provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: false,
        lastCheckAt: Date.now(),
        error: lastError.message
      });
    }
  }
  throw lastError ?? new Error("All providers in fallback chain failed");
}
async function* runCompletionStream(deps, request, agentConfig) {
  const providers2 = [
    agentConfig.model,
    ...agentConfig.fallbackChain ?? []
  ];
  let lastError = null;
  for (const providerRef of providers2) {
    const plugin = getProviderPlugin(deps.registry, providerRef.provider);
    if (!plugin)
      continue;
    try {
      const stream = plugin.completeStream({
        ...request,
        model: providerRef.model,
        temperature: providerRef.temperature,
        maxTokens: providerRef.maxTokens
      });
      for await (const chunk of stream) {
        yield chunk;
      }
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: true,
        lastCheckAt: Date.now()
      });
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      deps.logger.warn("llm", `Streaming provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: false,
        lastCheckAt: Date.now(),
        error: lastError.message
      });
    }
  }
  throw lastError ?? new Error("All providers in fallback chain failed");
}
var init_agent_runner = __esm({
  "packages/gateway/dist/agent-runner.js"() {
    "use strict";
    init_dist2();
    init_utils();
  }
});

// packages/gateway/dist/tool-executor.js
async function executeToolCalls(deps, toolCalls, agentConfig, sessionKey, senderId) {
  const results = [];
  for (const tc of toolCalls) {
    const tool = getTool(tc.name);
    if (!tool) {
      results.push({ id: tc.id, name: tc.name, result: "", error: `Unknown tool: ${tc.name}` });
      continue;
    }
    const ownerId = deps.config.ownerId ?? deps.config.devices?.find((d) => d.paired)?.id ?? "owner";
    if (requiresApproval(tc.name, agentConfig, senderId, ownerId)) {
      const approval = deps.approvalManager.requestApproval(tc.name, tc.arguments, agentConfig.id, sessionKey);
      deps.broadcastWs({
        type: "approval:required",
        approvalId: approval.id,
        tool: tc.name,
        args: tc.arguments,
        agentId: agentConfig.id
      });
      const resolved = await waitForApproval(deps.approvalManager, approval.id, 6e4);
      if (!resolved || resolved.status !== "approved") {
        results.push({
          id: tc.id,
          name: tc.name,
          result: "",
          error: resolved?.status === "denied" ? "User denied approval" : "Approval timed out"
        });
        continue;
      }
    }
    try {
      const workspacePath = getWorkspacePath(deps.config);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 3e4);
      const toolResult = await tool.execute(tc.arguments, {
        agentId: agentConfig.id,
        sessionKey,
        workspacePath,
        sandbox: agentConfig.sandbox,
        signal: abortController.signal
      });
      clearTimeout(timeoutId);
      results.push({
        id: tc.id,
        name: tc.name,
        result: toolResult.output,
        error: toolResult.error
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ id: tc.id, name: tc.name, result: "", error: errorMsg });
    }
  }
  return results;
}
function waitForApproval(manager, approvalId, timeoutMs) {
  return new Promise((resolve3) => {
    const startTime = Date.now();
    const check = () => {
      const approval = manager.getApproval(approvalId);
      if (!approval || approval.status !== "pending") {
        resolve3(approval ?? null);
        return;
      }
      if (Date.now() - startTime > timeoutMs) {
        manager.resolveApproval(approvalId, false);
        resolve3(null);
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });
}
var init_tool_executor = __esm({
  "packages/gateway/dist/tool-executor.js"() {
    "use strict";
    init_dist();
    init_dist5();
    init_dist4();
  }
});

// packages/gateway/dist/session-manager.js
var SessionManager;
var init_session_manager = __esm({
  "packages/gateway/dist/session-manager.js"() {
    "use strict";
    init_dist3();
    init_esm();
    SessionManager = class {
      storage;
      logger;
      activeSessions = /* @__PURE__ */ new Map();
      constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
      }
      // ── Session Lifecycle ─────────────────────────────────────────────
      /**
       * Get or create a session for the given channel/sender/agent triple.
       */
      async getOrCreate(channelId, senderId, agentId, conversationId) {
        const sessionKey = deriveSessionKey(channelId, senderId, agentId);
        if (this.activeSessions.has(sessionKey)) {
          return this.activeSessions.get(sessionKey);
        }
        let manifest = await this.storage.getSessionManifest(agentId, sessionKey);
        if (!manifest) {
          manifest = {
            sessionKey,
            agentId,
            channelId,
            senderId,
            conversationId,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            turnCount: 0,
            compactionPoints: []
          };
          await this.storage.upsertSessionManifest(manifest);
          this.logger.debug("session", `Created new session: ${sessionKey}`);
        }
        const turns = await this.storage.getSessionTranscript(agentId, sessionKey);
        const session = {
          sessionKey,
          agentId,
          channelId,
          senderId,
          manifest,
          turns
        };
        this.activeSessions.set(sessionKey, session);
        return session;
      }
      /**
       * Spawn a new isolated session for a sub-agent task.
       * Returns the new session key.
       */
      async spawnSession(parentSessionKey, targetAgentId, initialMessage, context) {
        const spawnId = v4_default().slice(0, 8);
        const sessionKey = `spawn:${targetAgentId}:${spawnId}`;
        const manifest = {
          sessionKey,
          agentId: targetAgentId,
          channelId: "internal",
          senderId: `session:${parentSessionKey}`,
          conversationId: `spawn-${spawnId}`,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          turnCount: 0,
          compactionPoints: []
        };
        await this.storage.upsertSessionManifest(manifest);
        const userTurn = {
          role: "user",
          content: initialMessage,
          timestamp: Date.now()
        };
        await this.storage.appendTurn(targetAgentId, sessionKey, userTurn);
        if (context && Object.keys(context).length > 0) {
          const contextTurn = {
            role: "system",
            content: `Context from parent session: ${JSON.stringify(context)}`,
            timestamp: Date.now()
          };
          await this.storage.appendTurn(targetAgentId, sessionKey, contextTurn);
        }
        this.logger.info("session", `Spawned session ${sessionKey} from parent ${parentSessionKey}`);
        return {
          sessionKey,
          agentId: targetAgentId,
          parentSessionKey,
          manifest
        };
      }
      /**
       * Send a message to an existing session (cross-session communication).
       */
      async sendToSession(targetSessionKey, targetAgentId, message) {
        const turn = {
          role: "user",
          content: message,
          timestamp: Date.now()
        };
        await this.storage.appendTurn(targetAgentId, targetSessionKey, turn);
        this.logger.debug("session", `Sent message to session ${targetSessionKey}`);
      }
      /**
       * List all sessions for an agent.
       */
      async listSessions(agentId) {
        return this.storage.listSessions(agentId);
      }
      /**
       * Get the full transcript for a session.
       */
      async getTranscript(agentId, sessionKey) {
        return this.storage.getSessionTranscript(agentId, sessionKey);
      }
      /**
       * Reset (delete) a session.
       */
      async resetSession(agentId, sessionKey) {
        await this.storage.deleteSession(agentId, sessionKey);
        this.activeSessions.delete(sessionKey);
        this.logger.info("session", `Session reset: ${sessionKey}`);
      }
      /**
       * Append a turn to a session and update the manifest.
       */
      async appendTurn(agentId, sessionKey, turn) {
        await this.storage.appendTurn(agentId, sessionKey, turn);
        const session = this.activeSessions.get(sessionKey);
        if (session) {
          session.turns.push(turn);
          session.manifest.lastActiveAt = Date.now();
          session.manifest.turnCount = session.turns.length;
          await this.storage.upsertSessionManifest(session.manifest);
        }
      }
      /**
       * Run compaction if the session exceeds the threshold.
       */
      async maybeCompact(agentId, sessionKey, threshold, summarizer) {
        const session = this.activeSessions.get(sessionKey);
        if (!session || session.turns.length < threshold) {
          return session?.turns ?? [];
        }
        this.logger.debug("session", `Compacting session ${sessionKey} (${session.turns.length} turns)`);
        const compacted = await compactSession(this.storage, agentId, sessionKey, threshold, async (olderTurns) => summarizer(olderTurns));
        await this.storage.rewriteSession(agentId, sessionKey, compacted);
        session.turns = compacted;
        return compacted;
      }
      /**
       * Get the count of currently tracked sessions.
       */
      get activeCount() {
        return this.activeSessions.size;
      }
    };
  }
});

// packages/gateway/dist/index.js
var dist_exports2 = {};
__export(dist_exports2, {
  MxClawGateway: () => MxClawGateway,
  SessionManager: () => SessionManager
});
var http3, path13, MxClawGateway;
var init_dist10 = __esm({
  "packages/gateway/dist/index.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_rate_limiter();
    init_dist3();
    init_dist4();
    init_secrets();
    init_dist5();
    init_dist6();
    init_dist7();
    init_dist8();
    init_dist9();
    init_context_engine();
    http3 = __toESM(require("node:http"), 1);
    path13 = __toESM(require("node:path"), 1);
    init_wrapper();
    init_esm();
    init_http_handler();
    init_ws_handler();
    init_agent_runner();
    init_tool_executor();
    init_session_manager();
    init_utils();
    init_session_manager();
    MxClawGateway = class {
      config;
      registry = createPluginRegistry();
      storage;
      logger;
      approvalManager = new ApprovalManager();
      voiceManager = new VoiceManager();
      sessionManager;
      server;
      wss;
      wsClients = /* @__PURE__ */ new Map();
      outboundQueues = /* @__PURE__ */ new Map();
      startTime = Date.now();
      configWatcherDispose;
      channelMessageCounts = /* @__PURE__ */ new Map();
      providerStatuses = /* @__PURE__ */ new Map();
      rateLimiter = new IPRateLimiter();
      skillLoader;
      contextEngine;
      secretsManager;
      memory;
      constructor(configPath) {
        this.config = loadConfig(configPath);
      }
      // ── Lifecycle ─────────────────────────────────────────────────────
      async start() {
        this.logger = createLogger(this.config.logging);
        this.logger.info("gateway", "Starting mxclaw Gateway...");
        if (this.config.storage.type === "sqlite") {
          this.storage = new SqliteStorageAdapter(this.config);
        } else {
          this.storage = new JsonlStorageAdapter(this.config);
        }
        await this.storage.initialize();
        try {
          this.memory = new InMemoryMemoryAdapter(path13.join(getWorkspacePath(this.config), "memory.jsonl"));
          await this.memory.load();
          registerMemoryAdapter(this.memory);
          this.logger.info("gateway", `Memory loaded (${(await this.memory.stats()).total} entries)`);
        } catch (err) {
          this.logger.warn("gateway", `Memory init skipped: ${err instanceof Error ? err.message : err}`);
        }
        try {
          this.secretsManager = new SecretsManager(getWorkspacePath(this.config));
          await this.secretsManager.load();
          this.resolveConfigSecrets();
          this.logger.info("gateway", `Secrets vault loaded (${this.secretsManager.listKeys().length} keys)`);
        } catch (err) {
          this.logger.warn("gateway", `Secrets vault skipped: ${err instanceof Error ? err.message : err}`);
        }
        this.sessionManager = new SessionManager(this.storage, this.logger);
        await loadPlugins(this.config, this.registry);
        this.logger.info("gateway", `Loaded ${this.registry.channels.size} channels, ${this.registry.providers.size} providers, ${this.registry.voices.size} voices`);
        for (const [name, voice] of this.registry.voices) {
          this.voiceManager.register(voice);
          this.logger.debug("gateway", `Registered voice plugin: ${name}`);
        }
        this.contextEngine = new ContextEngine(this.logger, getWorkspacePath(this.config));
        try {
          this.skillLoader = new SkillLoader(getWorkspacePath(this.config), this.logger);
          await this.skillLoader.loadAll();
          const loaded = this.skillLoader.getAllSkills();
          this.logger.info("gateway", `Loaded ${loaded.length} skills: ${loaded.map((s) => s.name).join(", ") || "(none)"}`);
        } catch (err) {
          this.logger.warn("gateway", `Skill loading skipped: ${err instanceof Error ? err.message : err}`);
        }
        await this.startChannels();
        await this.startServer();
        this.configWatcherDispose = watchConfig((newConfig) => {
          this.logger.info("gateway", "Config hot-reloaded");
          this.config = newConfig;
          this.startChannels().catch((err) => this.logger.error("gateway", "Failed to reload channels", err));
        });
        const shutdownHandler = async () => {
          this.logger.info("gateway", "Received shutdown signal");
          await this.stop();
          process.exit(0);
        };
        process.on("SIGTERM", shutdownHandler);
        process.on("SIGINT", shutdownHandler);
        this.logger.info("gateway", `Gateway listening on ${this.config.gateway.host}:${this.config.gateway.port}`);
      }
      async stop() {
        this.logger.info("gateway", "Shutting down...");
        this.configWatcherDispose?.();
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
          const plugin = getChannelPlugin(this.registry, channelConfig.type);
          if (plugin) {
            await plugin.stopChannel(channelId).catch(() => {
            });
          }
        }
        for (const [, client] of this.wsClients) {
          client.ws.close(1001, "Server shutting down");
        }
        this.wss?.close();
        this.server?.close();
        await this.storage.close();
        this.logger.info("gateway", "Gateway stopped");
      }
      // ── Channels ──────────────────────────────────────────────────────
      async startChannels() {
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
          if (!channelConfig.enabled)
            continue;
          const plugin = getChannelPlugin(this.registry, channelConfig.type);
          if (!plugin) {
            this.logger.warn("gateway", `No plugin for channel type "${channelConfig.type}" (${channelId})`);
            this.registry.pluginErrors.push({
              plugin: channelConfig.type,
              error: `No plugin registered for channel type`
            });
            continue;
          }
          try {
            await plugin.setupChannel(channelConfig);
            await plugin.startChannel(channelConfig, async (envelope) => {
              await this.handleInboundMessage(envelope);
            });
            this.channelMessageCounts.set(channelId, 0);
            this.logger.info("gateway", `Channel started: ${channelId} (${channelConfig.type})`);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("gateway", `Failed to start channel ${channelId}: ${errorMsg}`);
            this.registry.pluginErrors.push({ plugin: channelConfig.type, error: errorMsg });
          }
        }
      }
      // ── Server ────────────────────────────────────────────────────────
      async startServer() {
        const { host, port } = this.config.gateway;
        this.server = http3.createServer((req, res) => {
          const ctx = this.buildContext();
          handleHttpRequest(ctx, req, res);
        });
        this.wss = new import_websocket_server.default({ server: this.server });
        this.wss.on("connection", (ws, _req) => {
          handleWebSocketConnection({
            logger: this.logger,
            approvalManager: this.approvalManager,
            voiceManager: this.voiceManager,
            wsClients: this.wsClients,
            wsHeartbeatIntervalMs: this.config.gateway.wsHeartbeatIntervalMs,
            voiceDefaultProvider: this.config.voice.defaultProvider,
            handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
            wsRateLimit: 20
          }, ws);
        });
        return new Promise((resolve3) => {
          this.server.listen(port, host, () => resolve3());
        });
      }
      // ── Message Routing Engine ────────────────────────────────────────
      async handleInboundMessage(envelope) {
        this.logger.debug("router", `Message from ${envelope.sender.id} on ${envelope.channel}`);
        const count = this.channelMessageCounts.get(envelope.channel) ?? 0;
        this.channelMessageCounts.set(envelope.channel, count + 1);
        const channelConfig = this.config.channels[envelope.channel];
        if (!channelConfig) {
          this.logger.warn("router", `Unknown channel: ${envelope.channel}`);
          return;
        }
        if (!isSenderAllowed(envelope, channelConfig)) {
          if (channelConfig.pairingEnabled) {
            const pairing = generatePairingCode(envelope.channel, envelope.sender.id);
            this.logger.info("security", `Pairing code generated for ${envelope.sender.id}: ${pairing.code}`);
            const plugin = getChannelPlugin(this.registry, channelConfig.type);
            if (plugin) {
              await plugin.sendMessage(envelope.channel, {
                conversationId: envelope.conversationId,
                metadata: {},
                isStreaming: false,
                content: [{
                  type: "text",
                  text: `\u{1F510} New sender detected. Pairing code: **${pairing.code}**
Use this code in the control UI to approve this sender. Expires in 5 minutes.`
                }]
              });
            }
          }
          return;
        }
        const agentId = this.resolveAgentBinding(envelope);
        const agentConfig = this.config.agents[agentId];
        if (!agentConfig) {
          this.logger.warn("router", `No agent config for "${agentId}"`);
          return;
        }
        if (!shouldRespondToMessage(envelope, agentConfig, channelConfig)) {
          this.logger.debug("router", `Mention gating: skipping message from ${envelope.sender.id}`);
          return;
        }
        const sessionKey = deriveSessionKey(envelope.channel, envelope.sender.id, agentId);
        await this.processMessage(envelope, agentConfig, channelConfig, sessionKey);
      }
      resolveAgentBinding(envelope) {
        const bindings = this.config.bindings ?? [];
        const exactMatch = bindings.find((b) => b.channelId === envelope.channel && b.senderId === envelope.sender.id);
        if (exactMatch)
          return exactMatch.agentId;
        const channelMatch = bindings.find((b) => b.channelId === envelope.channel && !b.senderId);
        if (channelMatch)
          return channelMatch.agentId;
        return this.config.defaultAgentId ?? "default";
      }
      // ── Message Processing Pipeline ───────────────────────────────────
      async processMessage(envelope, agentConfig, channelConfig, sessionKey) {
        const agentId = agentConfig.id;
        const channelPlugin = getChannelPlugin(this.registry, channelConfig.type);
        const session = await this.sessionManager.getOrCreate(envelope.channel, envelope.sender.id, agentId, envelope.conversationId);
        let turns = session.turns;
        if (turns.length >= agentConfig.compactionThreshold) {
          turns = await this.sessionManager.maybeCompact(agentId, sessionKey, agentConfig.compactionThreshold, async (olderTurns) => {
            const summaryRequest = {
              model: agentConfig.model.model,
              messages: [
                { role: "system", content: "Summarize the following conversation concisely, preserving key facts, decisions, and context." },
                { role: "user", content: JSON.stringify(olderTurns.map((t) => ({ role: t.role, content: t.content }))) }
              ],
              maxTokens: 500
            };
            try {
              const deps = { registry: this.registry, logger: this.logger, providerStatuses: this.providerStatuses };
              const response = await runCompletion(deps, summaryRequest, agentConfig);
              return response.content;
            } catch {
              return "Previous conversation summary unavailable.";
            }
          });
        }
        const userText = envelope.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
        const userTurn = { role: "user", content: userText, timestamp: Date.now() };
        await this.sessionManager.appendTurn(agentId, sessionKey, userTurn);
        turns.push(userTurn);
        let systemPrompt = agentConfig.systemPrompt ?? agentConfig.model.systemPrompt ?? "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";
        let messages;
        if (this.contextEngine) {
          messages = await this.contextEngine.buildContext({
            agentConfig,
            turns,
            skillLoader: this.skillLoader,
            maxTokens: agentConfig.model.maxContextTokens ?? 128e3
          });
        } else {
          if (this.skillLoader) {
            const skillsPrompt = this.skillLoader.buildSkillsPrompt();
            if (skillsPrompt) {
              systemPrompt += skillsPrompt;
            }
          }
          messages = [
            { role: "system", content: systemPrompt },
            ...turns.map((t) => ({ role: t.role, content: t.content }))
          ];
        }
        const enabledTools = new Set(Object.entries(agentConfig.tools ?? {}).filter(([, cfg]) => cfg.enabled).map(([name]) => name));
        const toolDefs = getToolDefinitionsForLLM(enabledTools);
        const completionRequest = {
          model: agentConfig.model.model,
          messages,
          tools: toolDefs.length > 0 ? toolDefs : void 0,
          temperature: agentConfig.model.temperature,
          maxTokens: agentConfig.model.maxTokens,
          stream: true
        };
        let fullResponse = "";
        let toolCalls = [];
        const runnerDeps = {
          registry: this.registry,
          logger: this.logger,
          providerStatuses: this.providerStatuses
        };
        try {
          const stream = runCompletionStream(runnerDeps, completionRequest, agentConfig);
          for await (const chunk of stream) {
            fullResponse += chunk.content;
            if (chunk.toolCalls) {
              for (const tc of chunk.toolCalls) {
                const existing = toolCalls.find((t) => t.id === tc.id);
                if (existing) {
                  existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
                } else {
                  toolCalls.push({
                    id: tc.id,
                    name: tc.name,
                    arguments: tryParseJson(tc.arguments) ?? {}
                  });
                }
              }
            }
            if (channelPlugin && chunk.content) {
              await channelPlugin.sendMessage(envelope.channel, {
                conversationId: envelope.conversationId,
                threadId: envelope.threadId,
                metadata: {},
                isStreaming: true,
                content: [{ type: "text", text: chunk.content }],
                streamToken: v4_default()
              });
            }
            broadcastWs(this.wsClients, {
              type: "chat:token",
              token: chunk.content,
              conversationId: envelope.conversationId,
              messageId: envelope.id
            });
          }
          let roundMessages = [...messages];
          let currentResponse = fullResponse;
          let currentToolCalls = toolCalls;
          let round = 0;
          const MAX_TOOL_ROUNDS = 5;
          while (currentToolCalls.length > 0 && round < MAX_TOOL_ROUNDS) {
            round++;
            this.logger.debug("router", `Tool round ${round}: executing ${currentToolCalls.length} tool(s)`);
            const toolResults = await executeToolCalls({
              config: this.config,
              logger: this.logger,
              approvalManager: this.approvalManager,
              broadcastWs: (msg) => broadcastWs(this.wsClients, msg)
            }, currentToolCalls, agentConfig, sessionKey, envelope.sender.id);
            const toolResultContent = toolResults.map((tr) => `[${tr.name}]: ${tr.result}${tr.error ? `
Error: ${tr.error}` : ""}`).join("\n");
            const toolTurn = {
              role: "tool",
              content: toolResultContent,
              toolCalls: currentToolCalls.map((tc) => ({
                id: tc.id,
                name: tc.name,
                arguments: tc.arguments
              })),
              toolResults: toolResults.map((tr) => ({
                id: tr.id,
                name: tr.name,
                result: tr.result,
                error: tr.error
              })),
              timestamp: Date.now()
            };
            await this.sessionManager.appendTurn(agentId, sessionKey, toolTurn);
            roundMessages = [
              ...roundMessages,
              { role: "assistant", content: currentResponse },
              { role: "tool", content: toolResultContent }
            ];
            const followUpRequest = {
              ...completionRequest,
              messages: roundMessages
            };
            let followUpResponse = "";
            currentToolCalls = [];
            const followUpStream = runCompletionStream(runnerDeps, followUpRequest, agentConfig);
            for await (const chunk of followUpStream) {
              followUpResponse += chunk.content;
              if (chunk.toolCalls) {
                for (const tc of chunk.toolCalls) {
                  const existing = currentToolCalls.find((t) => t.id === tc.id);
                  if (existing) {
                    existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
                  } else {
                    currentToolCalls.push({
                      id: tc.id,
                      name: tc.name,
                      arguments: tryParseJson(tc.arguments) ?? {}
                    });
                  }
                }
              }
              if (channelPlugin && chunk.content) {
                await channelPlugin.sendMessage(envelope.channel, {
                  conversationId: envelope.conversationId,
                  threadId: envelope.threadId,
                  metadata: {},
                  isStreaming: true,
                  content: [{ type: "text", text: chunk.content }]
                });
              }
              broadcastWs(this.wsClients, {
                type: "chat:token",
                token: chunk.content,
                conversationId: envelope.conversationId,
                messageId: envelope.id
              });
            }
            currentResponse = followUpResponse;
            fullResponse = followUpResponse;
          }
          if (round >= MAX_TOOL_ROUNDS && currentToolCalls.length > 0) {
            this.logger.warn("router", `Tool loop hit max rounds (${MAX_TOOL_ROUNDS}) \u2014 stopping`);
          }
          const assistantTurn = {
            role: "assistant",
            content: fullResponse,
            timestamp: Date.now()
          };
          await this.sessionManager.appendTurn(agentId, sessionKey, assistantTurn);
          if (channelPlugin) {
            await channelPlugin.sendMessage(envelope.channel, {
              conversationId: envelope.conversationId,
              threadId: envelope.threadId,
              metadata: {},
              isStreaming: false,
              content: [{ type: "text", text: "" }],
              // Empty = stream-end signal
              streamDone: true
            });
          }
          broadcastWs(this.wsClients, {
            type: "chat:done",
            conversationId: envelope.conversationId,
            messageId: envelope.id,
            fullText: fullResponse
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          this.logger.error("router", `Completion error for session ${sessionKey}: ${errorMsg}`);
          if (channelPlugin) {
            await channelPlugin.sendMessage(envelope.channel, {
              conversationId: envelope.conversationId,
              metadata: {},
              isStreaming: false,
              content: [{ type: "text", text: `\u274C Error: ${errorMsg}` }]
            });
          }
          broadcastWs(this.wsClients, {
            type: "chat:error",
            conversationId: envelope.conversationId,
            error: errorMsg
          });
        }
      }
      // ── Secrets Resolution ────────────────────────────────────────────
      resolveConfigSecrets() {
        if (!this.secretsManager)
          return;
        const resolve3 = (val) => {
          if (typeof val === "string")
            return this.secretsManager.resolve(val);
          if (Array.isArray(val))
            return val.map(resolve3);
          if (val && typeof val === "object") {
            const out = {};
            for (const [k, v] of Object.entries(val))
              out[k] = resolve3(v);
            return out;
          }
          return val;
        };
        this.config = resolve3(this.config);
      }
      // ── Context Builder ───────────────────────────────────────────────
      buildContext() {
        return {
          config: this.config,
          registry: this.registry,
          storage: this.storage,
          memory: this.memory,
          logger: this.logger,
          approvalManager: this.approvalManager,
          rateLimiter: this.rateLimiter,
          channelMessageCounts: this.channelMessageCounts,
          providerStatuses: this.providerStatuses,
          outboundQueues: this.outboundQueues,
          startTime: this.startTime,
          skillLoader: this.skillLoader,
          handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
          broadcastWs: (msg, exclude) => broadcastWs(this.wsClients, msg, exclude)
        };
      }
      /** Expose session manager for tool integration. */
      getSessionManager() {
        return this.sessionManager;
      }
    };
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// packages/cli/src/index.ts
init_dist();
init_dist10();
init_dist2();
init_dist3();
init_dist6();

// packages/cli/src/onboard.ts
var readline = __toESM(require("node:readline"), 1);
var fs13 = __toESM(require("node:fs"), 1);
var path14 = __toESM(require("node:path"), 1);
var os4 = __toESM(require("node:os"), 1);
init_dist();
var PROVIDER_PRESETS = {
  openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", defaultModel: "gpt-4o", description: "GPT-4o, GPT-4, o1, o3 \u2014 best all-around", docsUrl: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-4-20250514", description: "Claude Sonnet 4, Opus 4 \u2014 best for coding & analysis", docsUrl: "https://console.anthropic.com/settings/keys" },
  groq: { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", envKey: "GROQ_API_KEY", defaultModel: "llama-3.3-70b-versatile", description: "Fastest inference \u2014 Llama, Mixtral, Gemma", docsUrl: "https://console.groq.com/keys" },
  deepseek: { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", envKey: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat", description: "DeepSeek V3, R1 \u2014 cheap & powerful", docsUrl: "https://platform.deepseek.com/api-keys" },
  together: { name: "Together AI", baseUrl: "https://api.together.xyz/v1", envKey: "TOGETHER_API_KEY", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", description: "Open-source models at scale" },
  fireworks: { name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", envKey: "FIREWORKS_API_KEY", defaultModel: "llama-v3p3-70b-instruct", description: "Fast serverless inference" },
  xai: { name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", envKey: "XAI_API_KEY", defaultModel: "grok-3", description: "Grok 3 \u2014 real-time knowledge" },
  perplexity: { name: "Perplexity", baseUrl: "https://api.perplexity.ai", envKey: "PERPLEXITY_API_KEY", defaultModel: "sonar-pro", description: "Sonar \u2014 web-search augmented" },
  mistral: { name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", envKey: "MISTRAL_API_KEY", defaultModel: "mistral-large-latest", description: "Mistral Large, Small, Pixtral" },
  gemini: { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta", envKey: "GEMINI_API_KEY", defaultModel: "gemini-2.5-pro-exp-03-25", description: "Gemini 2.5 Pro, Flash \u2014 multimodal", docsUrl: "https://aistudio.google.com/apikey" },
  openrouter: { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", envKey: "OPENROUTER_API_KEY", defaultModel: "openai/gpt-4o", description: "Access 200+ models through one API" },
  ollama: { name: "Ollama (Local)", baseUrl: "http://localhost:11434/v1", envKey: "", defaultModel: "llama3.2", description: "Run models locally \u2014 free & private" },
  lmstudio: { name: "LM Studio (Local)", baseUrl: "http://localhost:1234/v1", envKey: "", defaultModel: "local-model", description: "Desktop app for local models" },
  vllm: { name: "vLLM (Local)", baseUrl: "http://localhost:8000/v1", envKey: "", defaultModel: "default", description: "High-throughput local serving" },
  custom: { name: "Custom OpenAI-Compatible", baseUrl: "", envKey: "", defaultModel: "default", description: "Any OpenAI-compatible API endpoint" }
};
var CHANNEL_TYPES = {
  discord: { name: "Discord", description: "Discord bot via WebSocket intents", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://discord.com/developers/applications" },
  telegram: { name: "Telegram", description: "Telegram bot via Bot API", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://t.me/BotFather" },
  slack: { name: "Slack", description: "Slack app via Socket Mode", needsToken: true, tokenLabel: "Bot Token + App Token" },
  whatsapp: { name: "WhatsApp", description: "WhatsApp via Baileys (QR code login)", needsToken: false, tokenLabel: "" },
  signal: { name: "Signal", description: "Signal via signal-cli REST API", needsToken: false, tokenLabel: "" },
  matrix: { name: "Matrix", description: "Matrix homeserver via sync API", needsToken: true, tokenLabel: "Access Token" },
  imessage: { name: "iMessage", description: "iMessage via BlueBubbles server (macOS only)", needsToken: true, tokenLabel: "Server URL + Password" },
  irc: { name: "IRC", description: "IRC via raw TCP socket", needsToken: false, tokenLabel: "" },
  googlechat: { name: "Google Chat", description: "Google Chat via REST API", needsToken: true, tokenLabel: "Service Account Key (JSON path)" },
  teams: { name: "Microsoft Teams", description: "Teams via Bot Framework", needsToken: true, tokenLabel: "Bot ID + Password" },
  feishu: { name: "Feishu/Lark", description: "Feishu/Lark via Open API", needsToken: true, tokenLabel: "App ID + App Secret" },
  line: { name: "LINE", description: "LINE via Messaging API", needsToken: true, tokenLabel: "Channel Access Token" },
  mattermost: { name: "Mattermost", description: "Mattermost via WebSocket API", needsToken: true, tokenLabel: "Access Token" },
  nextcloud: { name: "Nextcloud Talk", description: "Nextcloud Talk via OCS API", needsToken: true, tokenLabel: "Username + Password" },
  nostr: { name: "Nostr", description: "Nostr relay via WebSocket", needsToken: false, tokenLabel: "" },
  tlon: { name: "Tlon/Urbit", description: "Tlon/Urbit via HTTP SSE + poke", needsToken: true, tokenLabel: "Ship URL + Auth Code" },
  synology: { name: "Synology Chat", description: "Synology Chat via REST API polling", needsToken: true, tokenLabel: "Webhook URL" },
  twitch: { name: "Twitch", description: "Twitch chat via IRC", needsToken: true, tokenLabel: "Access Token + Username" },
  zalo: { name: "Zalo", description: "Zalo OA via Open REST API", needsToken: true, tokenLabel: "OA ID + App Secret" },
  wechat: { name: "WeChat", description: "WeChat Official Account via REST API", needsToken: true, tokenLabel: "App ID + App Secret" },
  qq: { name: "QQ", description: "QQ via OneBot v11 WebSocket", needsToken: false, tokenLabel: "" },
  webchat: { name: "WebChat", description: "WebChat via embedded WebSocket server", needsToken: false, tokenLabel: "" }
};
function detectPlatform() {
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  if (process.platform === "win32") return "windows";
  return "unsupported";
}
function getDaemonScriptPath() {
  const home = os4.homedir();
  switch (detectPlatform()) {
    case "macos":
      return path14.join(home, "Library", "LaunchAgents", "com.mxclaw.daemon.plist");
    case "linux":
      return path14.join(home, ".config", "systemd", "user", "mxclaw.service");
    case "windows":
      return path14.join(home, ".mxclaw", "mxclaw-daemon.ps1");
    default:
      return "";
  }
}
function generateLaunchdPlist(mxclawBin, configPath, logPath) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mxclaw.daemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>${mxclawBin}</string>
    <string>gateway</string>
    <string>--config</string>
    <string>${configPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin"}</string>
  </dict>
  <key>ThrottleInterval</key>
  <integer>5</integer>
</dict>
</plist>`;
}
function generateSystemdService(mxclawBin, configPath) {
  return `[Unit]
Description=MxClaw AI Agent Gateway
After=network.target

[Service]
Type=simple
ExecStart=${mxclawBin} gateway --config ${configPath}
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target`;
}
function generateWindowsScript(mxclawBin, configPath, logPath) {
  return `# MxClaw Daemon - Windows Scheduled Task Script
# Run this via: schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${getDaemonScriptPath()}\\"" /sc onlogon /delay 0000:30 /f
# Or manually: powershell -File "${getDaemonScriptPath()}"

while ($true) {
  try {
    & "${mxclawBin}" gateway --config "${configPath}" 2>&1 | Out-File -FilePath "${logPath}" -Append
  } catch {
    $_ | Out-File -FilePath "${logPath}" -Append
  }
  Start-Sleep -Seconds 5
}`;
}
function getMxClawBinPath() {
  const isDev = process.argv[1]?.includes("ts") || process.argv[1]?.includes("dist");
  if (isDev && process.argv[1]) {
    return process.argv[1];
  }
  try {
    const { execSync: execSync2 } = require("node:child_process");
    return execSync2("which mxclaw 2>/dev/null || where mxclaw 2>nul").toString().trim().split("\n")[0] ?? "mxclaw";
  } catch {
    return "mxclaw";
  }
}
async function installDaemon() {
  const platform = detectPlatform();
  if (platform === "unsupported") {
    console.log("  \u26A0\uFE0F  Daemon installation not supported on this platform.");
    return;
  }
  const mxclawBin = getMxClawBinPath();
  const configPath = getConfigPath();
  const logDir = path14.join(os4.homedir(), ".mxclaw");
  const logPath = path14.join(logDir, "daemon.log");
  const scriptPath = getDaemonScriptPath();
  if (!fs13.existsSync(logDir)) fs13.mkdirSync(logDir, { recursive: true });
  console.log(`  \u{1F4DD} Installing daemon for ${platform}...`);
  switch (platform) {
    case "macos": {
      const plist = generateLaunchdPlist(mxclawBin, configPath, logPath);
      const launchDir = path14.dirname(scriptPath);
      if (!fs13.existsSync(launchDir)) fs13.mkdirSync(launchDir, { recursive: true });
      fs13.writeFileSync(scriptPath, plist, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`launchctl load "${scriptPath}"`, { stdio: "pipe" });
        console.log("  \u2705 Daemon loaded via launchctl");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not load via launchctl (will auto-start on next login): ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
    case "linux": {
      const service = generateSystemdService(mxclawBin, configPath);
      const sysDir = path14.dirname(scriptPath);
      if (!fs13.existsSync(sysDir)) fs13.mkdirSync(sysDir, { recursive: true });
      fs13.writeFileSync(scriptPath, service, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`systemctl --user daemon-reload`, { stdio: "pipe" });
        execSync2(`systemctl --user enable mxclaw.service`, { stdio: "pipe" });
        execSync2(`systemctl --user start mxclaw.service`, { stdio: "pipe" });
        console.log("  \u2705 Daemon installed and started via systemd");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not start via systemd (will work after next login): ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
    case "windows": {
      const script = generateWindowsScript(mxclawBin, configPath, logPath);
      fs13.writeFileSync(scriptPath, script, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${scriptPath}\\"" /sc onlogon /delay 0000:30 /f`, { stdio: "pipe" });
        console.log("  \u2705 Scheduled task created (runs at logon)");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not create scheduled task: ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
  }
  console.log(`  \u{1F4CB} Logs: ${logPath}`);
}
async function uninstallDaemon() {
  const platform = detectPlatform();
  const scriptPath = getDaemonScriptPath();
  console.log(`  \u{1F5D1}\uFE0F  Removing daemon for ${platform}...`);
  switch (platform) {
    case "macos": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`launchctl unload "${scriptPath}"`, { stdio: "pipe" });
      } catch {
      }
      if (fs13.existsSync(scriptPath)) fs13.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    case "linux": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`systemctl --user stop mxclaw.service 2>/dev/null`, { stdio: "pipe" });
        execSync2(`systemctl --user disable mxclaw.service 2>/dev/null`, { stdio: "pipe" });
      } catch {
      }
      if (fs13.existsSync(scriptPath)) fs13.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    case "windows": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`schtasks /delete /tn "MxClawDaemon" /f`, { stdio: "pipe" });
      } catch {
      }
      if (fs13.existsSync(scriptPath)) fs13.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    default:
      console.log("  \u26A0\uFE0F  No daemon to remove on this platform.");
  }
}
async function daemonStatus() {
  const platform = detectPlatform();
  const scriptPath = getDaemonScriptPath();
  console.log(`  \u{1F50D} Checking daemon status (${platform})...
`);
  if (!fs13.existsSync(scriptPath)) {
    console.log("  \u274C Daemon not installed. Run 'mxclaw onboard --install-daemon'");
    return;
  }
  let running = false;
  let pid = "";
  switch (platform) {
    case "macos": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`launchctl list | grep com.mxclaw.daemon`, { encoding: "utf-8", stdio: "pipe" });
        if (out.trim()) {
          running = true;
          pid = out.trim().split("	")[0] ?? "";
        }
      } catch {
      }
      break;
    }
    case "linux": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`systemctl --user is-active mxclaw.service`, { encoding: "utf-8", stdio: "pipe" });
        running = out.trim() === "active";
        if (running) {
          const pidOut = execSync2(`systemctl --user show mxclaw.service -p MainPID`, { encoding: "utf-8", stdio: "pipe" });
          pid = pidOut.trim().replace("MainPID=", "");
        }
      } catch {
      }
      break;
    }
    case "windows": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`schtasks /query /tn "MxClawDaemon" /v /fo list 2>nul`, { encoding: "utf-8", stdio: "pipe" });
        running = out.includes("MxClawDaemon");
      } catch {
      }
      break;
    }
  }
  console.log(`  Daemon script: ${scriptPath}`);
  console.log(`  Status: ${running ? "\u2705 Running" : "\u23F9\uFE0F  Stopped"}`);
  if (pid) console.log(`  PID: ${pid}`);
}
async function testProvider(baseUrl, apiKey, model) {
  const start = Date.now();
  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const resp = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with just: OK" }],
        max_tokens: 10
      }),
      signal: AbortSignal.timeout(15e3)
    });
    const latency = Date.now() - start;
    if (resp.ok) return { ok: true, latency };
    const errText = await resp.text().catch(() => "");
    return { ok: false, latency, error: `${resp.status}: ${errText.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, latency: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}
function initializeWorkspace(workspacePath) {
  if (!fs13.existsSync(workspacePath)) {
    fs13.mkdirSync(workspacePath, { recursive: true });
    console.log(`  \u{1F4C1} Created workspace: ${workspacePath}`);
  }
  const agentsMd = path14.join(workspacePath, "AGENTS.md");
  if (!fs13.existsSync(agentsMd)) {
    fs13.writeFileSync(agentsMd, `# MxClaw Agent Workspace

This directory contains configuration, prompts, and skills for your MxClaw agents.

## Injected Prompt Files

- \`AGENTS.md\` \u2014 this file, always injected into every agent session
- \`SOUL.md\` \u2014 optional persona/soul definition
- \`TOOLS.md\` \u2014 optional tool usage guidelines

## Skills

Place skill directories under \`skills/<skill-name>/SKILL.md\`.

## Adding Files

Any markdown file placed here is automatically injected into agent context.
`, "utf-8");
    console.log(`  \u{1F4DD} Created: ${agentsMd}`);
  }
  const skillsDir = path14.join(workspacePath, "skills");
  if (!fs13.existsSync(skillsDir)) {
    fs13.mkdirSync(skillsDir, { recursive: true });
  }
}
var BOLD = "\x1B[1m";
var DIM = "\x1B[2m";
var GREEN = "\x1B[32m";
var YELLOW = "\x1B[33m";
var CYAN = "\x1B[36m";
var MAGENTA = "\x1B[35m";
var RESET = "\x1B[0m";
function color(s, c) {
  return `${c}${s}${RESET}`;
}
function printHeader() {
  console.log("");
  console.log(color(`  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`, CYAN));
  console.log(color(`  \u2551                                                      \u2551`, CYAN));
  console.log(color(`  \u2551           \u{1F99E}  ${BOLD}MxClaw Onboard Wizard${RESET}${CYAN}              \u2551`, CYAN));
  console.log(color(`  \u2551     ${DIM}Set up your personal AI agent gateway${RESET}${CYAN}        \u2551`, CYAN));
  console.log(color(`  \u2551                                                      \u2551`, CYAN));
  console.log(color(`  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`, CYAN));
  console.log("");
}
function printSection(title, subtitle) {
  console.log(color(`
  \u2500\u2500 ${BOLD}${title}${RESET} \u2500\u2500${subtitle ? ` ${DIM}${subtitle}${RESET}` : ""}
`, CYAN));
}
function printSummaryTable(summary) {
  const maxLen = Math.max(...summary.map((s) => s.label.length));
  console.log(color(`
  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510`, GREEN));
  console.log(color(`  \u2502              \u2705  Setup Complete!                        \u2502`, GREEN));
  console.log(color(`  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`, GREEN));
  console.log("");
  for (const s of summary) {
    const icon = s.ok ? "\u2705" : "\u26A0\uFE0F";
    console.log(`    ${icon}  ${s.label.padEnd(maxLen + 2)}${color(s.value, s.ok ? GREEN : YELLOW)}`);
  }
}
async function runOnboard() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const ask = (q) => new Promise((resolve3) => rl.question(q, resolve3));
  printHeader();
  console.log("  This wizard will guide you through setting up:");
  console.log("  \u2022  LLM provider(s) for AI responses");
  console.log("  \u2022  Messaging channel(s) for chatting with your agent");
  console.log("  \u2022  Agent configuration with model fallbacks");
  console.log("  \u2022  Gateway settings");
  console.log("  \u2022  Workspace initialization");
  console.log(color(`
  ${DIM}Press Ctrl+C at any time to exit.${RESET}
`, DIM));
  let config;
  const configPath = getConfigPath();
  const isNew = !fs13.existsSync(configPath);
  if (!isNew) {
    console.log(color(`  \u{1F4C4} ${BOLD}Loading existing config:${RESET} ${DIM}${configPath}${RESET}
`, YELLOW));
    config = loadConfig();
  } else {
    const configDir = getConfigDir();
    if (!fs13.existsSync(configDir)) fs13.mkdirSync(configDir, { recursive: true });
    config = {
      version: 1,
      gateway: { host: "127.0.0.1", port: 18700, webhookPath: "/gateway/webhook", corsOrigins: ["http://localhost:5173"], wsHeartbeatIntervalMs: 3e4 },
      agents: {},
      channels: {},
      bindings: [],
      devices: [],
      voice: { defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: { voiceId: "21m00Tcm4TlvDq8ikWAM" }, systemTts: {} },
      logging: { level: "info", subsystems: {}, otel: { enabled: false } },
      storage: { type: "jsonl", workspacePath: "~/.mxclaw/workspace", lanceDbPath: "~/.mxclaw/lancedb", sqlitePath: "~/.mxclaw/mxclaw.db" },
      plugins: [],
      sandbox: { enabled: false, type: "docker" },
      ownerId: void 0
    };
    console.log(color(`  \u{1F4C4} ${BOLD}Creating new config...${RESET}
`, GREEN));
  }
  printSection("Step 1: LLM Providers", "Pick models for your agent to use");
  console.log("  Available providers:\n");
  const presetKeys = Object.keys(PROVIDER_PRESETS);
  for (let i = 0; i < presetKeys.length; i++) {
    const key = presetKeys[i];
    const p = PROVIDER_PRESETS[key];
    console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${p.name.padEnd(22)}${RESET} ${DIM}${p.description}${RESET}`);
  }
  console.log(color(`
  ${DIM}Enter comma-separated numbers (e.g., 1,2,3), 'all', or press Enter to skip${RESET}`, DIM));
  const providerSelection = await ask(color("  Select providers > ", CYAN));
  const selectedIndices = [];
  if (providerSelection.toLowerCase() === "all") {
    for (let i = 0; i < presetKeys.length; i++) selectedIndices.push(i);
  } else if (providerSelection.trim()) {
    for (const part of providerSelection.split(",")) {
      const idx = parseInt(part.trim(), 10) - 1;
      if (idx >= 0 && idx < presetKeys.length) selectedIndices.push(idx);
    }
  }
  const providers2 = [];
  for (const idx of selectedIndices) {
    const key = presetKeys[idx];
    const preset = PROVIDER_PRESETS[key];
    console.log(color(`
  \u2500\u2500\u2500 ${BOLD}${preset.name}${RESET} \u2500\u2500\u2500`, MAGENTA));
    let apiKey = "";
    if (preset.envKey) {
      const envValue = process.env[preset.envKey] ?? "";
      if (envValue) {
        apiKey = envValue;
        console.log(color(`    \u2705 Found $${preset.envKey} in environment (${apiKey.slice(0, 8)}...)`, DIM));
      } else {
        if (preset.docsUrl) {
          console.log(color(`    ${DIM}Get a key at: ${preset.docsUrl}${RESET}`, DIM));
        }
        apiKey = await ask(color("    API key (or Enter to skip): ", CYAN));
      }
    }
    let baseUrl = preset.baseUrl;
    if (key === "custom") {
      baseUrl = await ask(color("    Base URL (e.g., https://api.example.com/v1): ", CYAN)) || baseUrl;
    }
    const modelInput = await ask(color(`    Model [${preset.defaultModel}]: `, CYAN));
    const model = modelInput || preset.defaultModel;
    if (apiKey || !preset.envKey) {
      const providerRef = {
        provider: "openai-compatible",
        model,
        apiKey: apiKey || void 0,
        baseUrl: baseUrl || void 0,
        preset: key,
        temperature: 0.7,
        maxTokens: 4096,
        options: {}
      };
      if (apiKey) {
        process.stdout.write(color("    Testing connectivity... ", DIM));
        const result = await testProvider(baseUrl || "https://api.openai.com/v1", apiKey, model);
        if (result.ok) {
          console.log(color(`\u2705 ${result.latency}ms`, GREEN));
        } else {
          console.log(color(`\u274C ${result.error ?? "unknown error"}`, YELLOW));
          const skipFail = await ask(color("    Add anyway? (y/N): ", CYAN));
          if (skipFail.toLowerCase() !== "y") {
            console.log(color("    \u23ED\uFE0F  Skipped", DIM));
            continue;
          }
        }
      }
      providers2.push(providerRef);
      console.log(color(`    \u2705 ${BOLD}${preset.name}${RESET} configured \u2192 ${model}`, GREEN));
    } else {
      console.log(color("    \u23ED\uFE0F  Skipped (no API key)", DIM));
    }
  }
  printSection("Step 2: Messaging Channels", "Connect platforms for your agent to live on");
  console.log("  Available channels:\n");
  const channelKeys = Object.keys(CHANNEL_TYPES);
  for (let i = 0; i < channelKeys.length; i++) {
    const key = channelKeys[i];
    const ch = CHANNEL_TYPES[key];
    console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${ch.name.padEnd(18)}${RESET} ${DIM}${ch.description}${RESET}`);
  }
  console.log(color(`
  ${DIM}Enter comma-separated numbers, 'all', or press Enter to skip${RESET}`, DIM));
  const channelSelection = await ask(color("  Select channels > ", CYAN));
  const channels = { ...config.channels };
  const selectedChannelIndices = [];
  if (channelSelection.toLowerCase() === "all") {
    for (let i = 0; i < channelKeys.length; i++) selectedChannelIndices.push(i);
  } else if (channelSelection.trim()) {
    for (const part of channelSelection.split(",")) {
      const idx = parseInt(part.trim(), 10) - 1;
      if (idx >= 0 && idx < channelKeys.length) selectedChannelIndices.push(idx);
    }
  }
  for (const idx of selectedChannelIndices) {
    const key = channelKeys[idx];
    const chInfo = CHANNEL_TYPES[key];
    console.log(color(`
  \u2500\u2500\u2500 ${BOLD}${chInfo.name}${RESET} \u2500\u2500\u2500`, MAGENTA));
    if (chInfo.docsUrl) {
      console.log(color(`    ${DIM}Setup guide: ${chInfo.docsUrl}${RESET}`, DIM));
    }
    const channelId = await ask(color(`  Channel ID [${key}-1]: `, CYAN)) || `${key}-1`;
    const credentials = {};
    if (chInfo.needsToken) {
      const tokenInput = await ask(color(`  ${chInfo.tokenLabel}: `, CYAN));
      if (tokenInput) {
        if (chInfo.tokenLabel.includes("+")) {
          const parts = chInfo.tokenLabel.split("+").map((s) => s.trim());
          const values = tokenInput.split(":").map((s) => s.trim());
          for (let j = 0; j < parts.length; j++) {
            const label = parts[j].toLowerCase().replace(/\s+/g, "");
            credentials[label] = values[j] ?? tokenInput;
          }
        } else if (chInfo.tokenLabel.includes("(") && chInfo.tokenLabel.includes(")")) {
          const label = chInfo.tokenLabel.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
          credentials[label] = tokenInput;
        } else {
          credentials["token"] = tokenInput;
        }
      }
    }
    channels[channelId] = {
      id: channelId,
      type: key,
      enabled: true,
      credentials,
      options: {},
      allowlist: [],
      mentionGating: true,
      pairingEnabled: true
    };
    console.log(color(`    \u2705 ${BOLD}${chInfo.name}${RESET} channel added: ${channelId}`, GREEN));
  }
  printSection("Step 3: Agent Configuration", "Configure your default agent");
  const agents = { ...config.agents };
  if (providers2.length > 0) {
    console.log("  Configured providers:\n");
    providers2.forEach((p, i) => {
      const preset = PROVIDER_PRESETS[p.preset ?? "custom"];
      console.log(`  ${color(String(i + 1), DIM)}. ${BOLD}${preset?.name ?? p.preset}${RESET} \u2192 ${DIM}${p.model}${RESET}`);
    });
    console.log(color(`
  ${DIM}Set up the default agent with a primary model.${RESET}`, DIM));
    const primaryIdxInput = await ask(color("  Primary provider (number) [1]: ", CYAN));
    const primaryIdx = parseInt(primaryIdxInput || "1", 10) - 1;
    const primaryProvider = providers2[primaryIdx] ?? providers2[0];
    if (!primaryProvider) {
      console.log("  No providers to configure. Skipping agent setup.");
    } else {
      const fallbackChain = [];
      if (providers2.length > 1) {
        const fallbackInput = await ask(color("  Fallback providers (comma-separated numbers, or Enter for none): ", CYAN));
        if (fallbackInput) {
          for (const part of fallbackInput.split(",")) {
            const fi = parseInt(part.trim(), 10) - 1;
            if (fi >= 0 && fi < providers2.length && fi !== primaryIdx) {
              fallbackChain.push(providers2[fi]);
            }
          }
        }
      }
      const systemPrompt = await ask(color("  System prompt (or Enter for default agent persona): ", CYAN));
      const name = await ask(color("  Agent name [Default Agent]: ", CYAN)) || "Default Agent";
      agents["default"] = {
        id: "default",
        name,
        description: "Primary MxClaw agent",
        model: primaryProvider,
        fallbackChain,
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          browser: { enabled: false, approval: "always-require-approval" },
          canvas: { enabled: true, approval: "owner-only" },
          cron: { enabled: false, approval: "always-require-approval" },
          sessionSpawn: { enabled: true, approval: "owner-only" },
          imageGen: { enabled: false, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
        },
        sandbox: { enabled: false, type: "docker" },
        voice: { provider: "system-tts" },
        systemPrompt: systemPrompt || "You are a helpful AI assistant powered by MxClaw.",
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      };
      console.log(color(`
    \u2705 ${BOLD}Agent "${name}"${RESET} configured`, GREEN));
      if (fallbackChain.length > 0) {
        console.log(color(`       Primary: ${primaryProvider.model} \u2192 Fallbacks: ${fallbackChain.map((f) => f.model).join(", ")}`, DIM));
      }
    }
  } else {
    console.log(color("  \u26A0\uFE0F  No providers configured. Add providers first or edit config later.", YELLOW));
    if (!agents["default"]) {
      agents["default"] = {
        id: "default",
        name: "Default Agent",
        description: "Primary MxClaw agent",
        model: { provider: "openai-compatible", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
        fallbackChain: [],
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          browser: { enabled: false, approval: "always-require-approval" },
          canvas: { enabled: true, approval: "owner-only" },
          cron: { enabled: false, approval: "always-require-approval" },
          sessionSpawn: { enabled: true, approval: "owner-only" },
          imageGen: { enabled: false, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
        },
        sandbox: { enabled: false, type: "docker" },
        voice: { provider: "system-tts" },
        systemPrompt: "You are a helpful AI assistant powered by MxClaw.",
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      };
      console.log(color("    \u{1F4DD} Created default agent with placeholder model (edit config to set API key)", YELLOW));
    }
  }
  printSection("Step 4: Gateway Settings", "Network configuration");
  const portInput = await ask(color(`  Gateway port [${config.gateway?.port ?? 18700}]: `, CYAN));
  if (portInput) {
    config.gateway = { ...config.gateway, port: parseInt(portInput, 10) };
  }
  const hostInput = await ask(color(`  Bind host [${config.gateway?.host ?? "127.0.0.1"}]: `, CYAN));
  if (hostInput) {
    config.gateway = { ...config.gateway, host: hostInput };
  }
  printSection("Step 5: Workspace", "Agent workspace and skills directory");
  const workspacePath = getWorkspacePath(config);
  initializeWorkspace(workspacePath);
  printSection("Step 6: Daemon (Optional)", "Auto-start gateway on boot");
  const installDmn = await ask(color("  Install system daemon? (auto-start gateway on boot) (y/N): ", CYAN));
  if (installDmn.toLowerCase() === "y") {
    await installDaemon();
  }
  config.agents = agents;
  config.channels = channels;
  config.defaultAgentId = "default";
  config.bindings = Object.keys(channels).map((channelId) => ({
    channelId,
    agentId: "default"
  }));
  saveConfig(config);
  const summary = [
    { label: "Config file", value: configPath, ok: true },
    { label: "Providers", value: providers2.length > 0 ? `${providers2.length} configured` : "none (edit config later)", ok: providers2.length > 0 },
    { label: "Channels", value: `${Object.keys(channels).length} configured`, ok: Object.keys(channels).length > 0 },
    { label: "Default agent", value: agents["default"]?.name ?? "not set", ok: !!agents["default"] },
    { label: "Gateway", value: `${config.gateway?.host ?? "127.0.0.1"}:${config.gateway?.port ?? 18700}`, ok: true },
    { label: "Workspace", value: workspacePath, ok: true },
    { label: "Daemon", value: installDmn.toLowerCase() === "y" ? "installed" : "not installed", ok: true }
  ];
  printSummaryTable(summary);
  const defaultAgent = agents["default"];
  if (defaultAgent) {
    const primaryModel = defaultAgent.model;
    const primaryPreset = PROVIDER_PRESETS[primaryModel.preset ?? ""];
    console.log(color(`
  ${BOLD}Model:${RESET} ${primaryPreset?.name ?? primaryModel.provider} \u2192 ${primaryModel.model}`, DIM));
    if (defaultAgent.fallbackChain && defaultAgent.fallbackChain.length > 0) {
      console.log(color(`  ${BOLD}Fallbacks:${RESET} ${defaultAgent.fallbackChain.map((f) => f.model).join(", ")}`, DIM));
    }
  }
  console.log(color(`
  ${BOLD}Next Steps:${RESET}
`, GREEN));
  console.log(color(`  ${"1.".padEnd(3)} Run ${BOLD}mxclaw doctor${RESET} to validate your configuration`, DIM));
  console.log(color(`  ${"2.".padEnd(3)} Run ${BOLD}mxclaw gateway${RESET} to start the server`, DIM));
  console.log(color(`  ${"3.".padEnd(3)} Open ${BOLD}http://localhost:5173${RESET} for the control UI`, DIM));
  console.log(color(`  ${"4.".padEnd(3)} ${BOLD}mxclaw onboard --help${RESET} for more options
`, DIM));
  if (providers2.length === 0) {
    console.log(color(`  \u26A0\uFE0F  ${BOLD}No providers configured.${RESET} Edit ${configPath} to add API keys.`, YELLOW));
  }
  if (Object.keys(channels).length === 0) {
    console.log(color(`  \u26A0\uFE0F  ${BOLD}No channels configured.${RESET} Run ${BOLD}mxclaw onboard${RESET} again or edit config.`, YELLOW));
  }
  rl.close();
}

// packages/cli/src/index.ts
var fs14 = __toESM(require("node:fs"), 1);
var path15 = __toESM(require("node:path"), 1);
var os5 = __toESM(require("node:os"), 1);
var program2 = new Command();
program2.name("mxclaw").description("mxclaw - Local-first personal AI agent gateway").version("0.1.0");
program2.command("gateway").description("Start the mxclaw gateway server").option("-c, --config <path>", "Path to config file", getConfigPath()).option("-p, --port <number>", "Override gateway port").action(async (options) => {
  const config = loadConfig(options.config);
  if (options.port) config.gateway.port = parseInt(options.port, 10);
  const gateway = new MxClawGateway(options.config);
  const shutdown = async () => {
    console.log("\nShutting down...");
    await gateway.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  await gateway.start();
  console.log(`mxclaw Gateway running on ${config.gateway.host}:${config.gateway.port}`);
  console.log(`Control UI: http://localhost:5173`);
  console.log(`Press Ctrl+C to stop`);
});
program2.command("setup").description("Interactive setup wizard for mxclaw").action(async () => {
  console.log("\u{1F527} mxclaw Setup Wizard\n");
  const configDir = getConfigDir();
  const configPath = getConfigPath();
  if (!fs14.existsSync(configDir)) {
    fs14.mkdirSync(configDir, { recursive: true });
    console.log(`Created config directory: ${configDir}`);
  }
  if (fs14.existsSync(configPath)) {
    console.log(`Config already exists at ${configPath}`);
    console.log("Run 'mxclaw doctor' to validate your config.");
    return;
  }
  const defaultConfig = generateDefaultConfig();
  saveConfig(defaultConfig);
  console.log(`\u2705 Created default config at ${configPath}`);
  console.log(`
Next steps:`);
  console.log(`  1. Edit ${configPath} to add your API keys and channels`);
  console.log(`  2. Run 'mxclaw gateway' to start the server`);
  console.log(`  3. Run 'mxclaw doctor' to validate your setup`);
});
program2.command("onboard").description("Interactive terminal setup wizard \u2014 configure providers, channels, and agents step by step").option("--install-daemon", "Install system daemon to auto-start gateway on boot").option("--uninstall-daemon", "Remove the system daemon").option("--status", "Check daemon status").option("--quick", "Quick setup with defaults (non-interactive)").action(async (options) => {
  if (options.installDaemon) {
    await installDaemon();
  } else if (options.uninstallDaemon) {
    await uninstallDaemon();
  } else if (options.status) {
    await daemonStatus();
  } else if (options.quick) {
    console.log("  \u26A1 Quick setup coming soon \u2014 use 'mxclaw onboard' for interactive setup");
  } else {
    await runOnboard();
  }
});
program2.command("runner").description("Quick start \u2014 run setup + doctor + gateway in one command").option("-p, --port <number>", "Gateway port", "18700").option("-h, --host <host>", "Bind host", "127.0.0.1").action(async (options) => {
  const { loadConfig: loadConfig2, saveConfig: saveConfig2, generateDefaultConfig: generateDefaultConfig2, getConfigPath: getConfigPath2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  const configPath = getConfigPath2();
  const fs15 = await import("node:fs");
  if (!fs15.existsSync(configPath)) {
    console.log("\u{1F4C4} No config found \u2014 creating default...");
    const defaultConfig = generateDefaultConfig2();
    saveConfig2(defaultConfig);
    console.log("\u2705 Default config created\n");
  }
  console.log("\u{1FA7A} Running diagnostics...\n");
  const config = loadConfig2();
  const issues = [];
  const warnings = [];
  const ok = [];
  ok.push(`Config: ${configPath}`);
  const agents = Object.keys(config.agents ?? {});
  if (agents.length === 0) warnings.push("No agents configured");
  else ok.push(`${agents.length} agent(s): ${agents.join(", ")}`);
  const channels = Object.keys(config.channels ?? {});
  if (channels.length === 0) warnings.push("No channels configured");
  else ok.push(`${channels.length} channel(s): ${channels.join(", ")}`);
  const defaultAgent = config.defaultAgentId ?? "default";
  if (!config.agents?.[defaultAgent]) issues.push(`Default agent "${defaultAgent}" not found`);
  else ok.push(`Default agent: ${defaultAgent}`);
  for (const o of ok) console.log(`  \u2705 ${o}`);
  for (const w of warnings) console.log(`  \u26A0\uFE0F  ${w}`);
  for (const i of issues) console.log(`  \u274C ${i}`);
  if (issues.length > 0) {
    console.log("\n\u274C Issues found. Run 'mxclaw onboard' to fix them.");
    return;
  }
  console.log(`
${warnings.length > 0 ? "\u26A0\uFE0F  Warnings exist but continuing..." : "\u2705 All checks passed!"}
`);
  console.log("\u{1F680} Starting MxClaw Gateway...\n");
  const { MxClawGateway: MxClawGateway2 } = await Promise.resolve().then(() => (init_dist10(), dist_exports2));
  config.gateway.port = parseInt(options.port, 10);
  config.gateway.host = options.host;
  const gateway = new MxClawGateway2(configPath);
  const shutdown = async () => {
    console.log("\n\u{1F6D1} Shutting down...");
    await gateway.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  await gateway.start();
  console.log(`
\u{1F99E}  MxClaw Gateway running on http://${config.gateway.host}:${config.gateway.port}`);
  console.log(`   Control UI: http://localhost:5173`);
  console.log(`   Health:     http://${config.gateway.host}:${config.gateway.port}/health`);
  console.log(`   Status:     http://${config.gateway.host}:${config.gateway.port}/status`);
  console.log(`
   Press Ctrl+C to stop
`);
});
program2.command("auth").description("Manage authentication and pairing").option("--list-pairings", "List pending pairing codes").option("--approve <code>", "Approve a pairing code").option("--deny <code>", "Deny a pairing code").option("--list-devices", "List paired devices").option("--unpair <deviceId>", "Unpair a device").action(async (options) => {
  const config = loadConfig();
  if (options.listPairings) {
    console.log("Pending pairing codes:");
    console.log("  (connect to running gateway for live data)");
  }
  if (options.approve) {
    console.log(`Approved pairing code: ${options.approve}`);
  }
  if (options.deny) {
    console.log(`Denied pairing code: ${options.deny}`);
  }
  if (options.listDevices) {
    const devices = config.devices ?? [];
    console.log("Paired devices:");
    for (const device of devices) {
      console.log(`  ${device.id} (${device.name}) - ${device.type} - ${device.paired ? "paired" : "pending"}`);
    }
  }
  if (options.unpair) {
    config.devices = (config.devices ?? []).filter((d) => d.id !== options.unpair);
    saveConfig(config);
    console.log(`Unpaired device: ${options.unpair}`);
  }
});
program2.command("channels").description("Manage messaging channels").option("--list", "List configured channels").option("--add <type>", "Add a new channel (discord, telegram, slack, whatsapp, etc.)").option("--remove <id>", "Remove a channel").option("--enable <id>", "Enable a channel").option("--disable <id>", "Disable a channel").option("--status", "Show channel connection status").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    console.log("Configured channels:");
    const channels = config.channels ?? {};
    for (const [id, ch] of Object.entries(channels)) {
      console.log(`  ${id} (${ch.type}) - ${ch.enabled ? "\u2705 enabled" : "\u274C disabled"}`);
    }
    if (Object.keys(channels).length === 0) {
      console.log("  No channels configured. Use --add to add one.");
    }
  }
  if (options.add) {
    const type = options.add;
    const id = `${type}-1`;
    const channelConfig = {
      id,
      type,
      enabled: true,
      credentials: {},
      options: {},
      allowlist: [],
      mentionGating: true,
      pairingEnabled: true
    };
    config.channels = { ...config.channels, [id]: channelConfig };
    saveConfig(config);
    console.log(`Added channel: ${id} (${type})`);
    console.log(`Edit ${getConfigPath()} to configure credentials.`);
  }
  if (options.remove) {
    const channels = { ...config.channels };
    delete channels[options.remove];
    config.channels = channels;
    saveConfig(config);
    console.log(`Removed channel: ${options.remove}`);
  }
  if (options.enable) {
    const ch = config.channels[options.enable];
    if (ch) {
      ch.enabled = true;
      saveConfig(config);
      console.log(`Enabled channel: ${options.enable}`);
    }
  }
  if (options.disable) {
    const ch = config.channels[options.disable];
    if (ch) {
      ch.enabled = false;
      saveConfig(config);
      console.log(`Disabled channel: ${options.disable}`);
    }
  }
  if (options.status) {
    console.log("Channel status: (connect to running gateway for live data)");
    console.log("Run 'mxclaw gateway' first, then check http://localhost:18700/status");
  }
});
program2.command("models").description("Manage LLM provider models").option("--list", "List configured agents and their models").option("--list-providers", "List available provider plugins").option("--set-default <agentId>", "Set the default agent").option("--add-agent <id>", "Add a new agent").option("--remove-agent <id>", "Remove an agent").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    console.log("Configured agents:");
    const agents = config.agents ?? {};
    for (const [id, agent] of Object.entries(agents)) {
      const isDefault = id === (config.defaultAgentId ?? "default");
      console.log(`  ${id}${isDefault ? " \u2B50 (default)" : ""}`);
      console.log(`    Model: ${agent.model.provider}/${agent.model.model}`);
      console.log(`    Fallback chain: ${agent.fallbackChain?.map((f) => `${f.provider}/${f.model}`).join(", ") ?? "none"}`);
      console.log(`    Tools: ${Object.entries(agent.tools ?? {}).filter(([, t]) => t.enabled).map(([n]) => n).join(", ") ?? "none"}`);
    }
  }
  if (options.listProviders) {
    console.log("Available provider plugins:");
    const providers2 = [
      "openai",
      "anthropic",
      "gemini",
      "groq",
      "deepseek",
      "lmstudio",
      "ollama",
      "together",
      "fireworks",
      "replicate",
      "cohere",
      "mistral",
      "perplexity",
      "xai",
      "bedrock",
      "azure",
      "cloudflare"
    ];
    for (const p of providers2) {
      console.log(`  - ${p}`);
    }
  }
  if (options.setDefault) {
    if (!config.agents[options.setDefault]) {
      console.error(`Agent "${options.setDefault}" not found.`);
      return;
    }
    config.defaultAgentId = options.setDefault;
    saveConfig(config);
    console.log(`Default agent set to: ${options.setDefault}`);
  }
  if (options.addAgent) {
    const id = options.addAgent;
    const agentConfig = {
      id,
      name: id,
      model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
      fallbackChain: [],
      tools: {
        bash: { enabled: true, approval: "always-require-approval" },
        browser: { enabled: false, approval: "always-require-approval" },
        canvas: { enabled: true, approval: "owner-only" },
        cron: { enabled: false, approval: "always-require-approval" },
        sessionSpawn: { enabled: true, approval: "owner-only" },
        imageGen: { enabled: false, approval: "always-require-approval" },
        fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
        fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
      },
      mentionGating: true,
      maxSessionTurns: 100,
      compactionThreshold: 50,
      sandbox: { enabled: false, type: "docker" },
      voice: { provider: "system-tts" }
    };
    config.agents = { ...config.agents, [id]: agentConfig };
    saveConfig(config);
    console.log(`Added agent: ${id}`);
  }
  if (options.removeAgent) {
    if (options.removeAgent === "default") {
      console.error("Cannot remove the default agent.");
      return;
    }
    const agents = { ...config.agents };
    delete agents[options.removeAgent];
    config.agents = agents;
    if (config.defaultAgentId === options.removeAgent) {
      config.defaultAgentId = "default";
    }
    saveConfig(config);
    console.log(`Removed agent: ${options.removeAgent}`);
  }
});
program2.command("sessions").description("Manage chat sessions").option("--list [agentId]", "List sessions for an agent").option("--view <sessionKey>", "View session transcript").option("--reset <sessionKey>", "Reset (delete) a session").option("--agent <agentId>", "Agent ID for session operations", "default").action(async (options) => {
  const config = loadConfig();
  const storage = new JsonlStorageAdapter(config);
  await storage.initialize();
  const agentId = options.agent ?? config.defaultAgentId ?? "default";
  if (options.list !== void 0) {
    const listAgentId = typeof options.list === "string" ? options.list : agentId;
    const sessions = await storage.listSessions(listAgentId);
    console.log(`Sessions for agent "${listAgentId}":`);
    if (sessions.length === 0) {
      console.log("  No sessions found.");
    }
    for (const s of sessions) {
      const age = Math.round((Date.now() - s.lastActiveAt) / 6e4);
      console.log(`  ${s.sessionKey} - ${s.turnCount} turns - last active ${age}m ago`);
    }
  }
  if (options.view) {
    const turns = await storage.getSessionTranscript(agentId, options.view);
    console.log(`Session: ${options.view} (${turns.length} turns)
`);
    for (const turn of turns) {
      const roleTag = turn.role === "user" ? "\u{1F464}" : turn.role === "assistant" ? "\u{1F916}" : turn.role === "system" ? "\u2699\uFE0F" : "\u{1F527}";
      console.log(`${roleTag} [${turn.role}] ${new Date(turn.timestamp).toLocaleString()}`);
      console.log(turn.content.slice(0, 200) + (turn.content.length > 200 ? "..." : ""));
      console.log("---");
    }
  }
  if (options.reset) {
    await storage.deleteSession(agentId, options.reset);
    console.log(`Session reset: ${options.reset}`);
  }
  await storage.close();
});
program2.command("doctor").description("Diagnose configuration and environment issues").action(async () => {
  console.log("\u{1FA7A} mxclaw Doctor\n");
  const issues = [];
  const warnings = [];
  const ok = [];
  const configPath = getConfigPath();
  if (fs14.existsSync(configPath)) {
    ok.push(`Config file exists: ${configPath}`);
    try {
      const config = loadConfig();
      ok.push("Config is valid JSON and passes schema validation");
      const agents = config.agents ?? {};
      if (Object.keys(agents).length === 0) {
        warnings.push("No agents configured. Add at least one agent.");
      } else {
        ok.push(`${Object.keys(agents).length} agent(s) configured`);
        for (const [id, agent] of Object.entries(agents)) {
          if (!agent.model.provider) {
            issues.push(`Agent "${id}" has no model provider configured`);
          }
        }
      }
      if (!config.defaultAgentId) {
        warnings.push("No default agent set. Inbound messages without a binding will be dropped.");
      } else if (!agents[config.defaultAgentId]) {
        issues.push(`Default agent "${config.defaultAgentId}" not found in agents config`);
      }
      const channels = config.channels ?? {};
      if (Object.keys(channels).length === 0) {
        warnings.push("No channels configured. Add channels to receive messages.");
      } else {
        ok.push(`${Object.keys(channels).length} channel(s) configured`);
        for (const [id, ch] of Object.entries(channels)) {
          if (!ch.credentials || Object.keys(ch.credentials).length === 0) {
            warnings.push(`Channel "${id}" (${ch.type}) has no credentials configured`);
          }
        }
      }
      const bindings = config.bindings ?? [];
      if (bindings.length === 0) {
        warnings.push("No bindings configured. Messages will route to the default agent.");
      }
      for (const [id, agent] of Object.entries(agents)) {
        for (const [toolName, toolCfg] of Object.entries(agent.tools ?? {})) {
          if (toolCfg.approval === "yolo") {
            warnings.push(`\u26A0\uFE0F Agent "${id}" tool "${toolName}" is in YOLO mode - no approval required!`);
          }
        }
      }
      for (const [id, agent] of Object.entries(agents)) {
        if (agent.sandbox?.enabled) {
          ok.push(`Agent "${id}" has sandbox enabled (${agent.sandbox.type})`);
        } else {
          const hasYolo = Object.values(agent.tools ?? {}).some((t) => t.approval === "yolo");
          if (hasYolo) {
            warnings.push(`Agent "${id}" has YOLO tools but no sandbox - consider enabling sandbox`);
          }
        }
      }
    } catch (err) {
      issues.push(`Config validation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    issues.push(`Config file not found: ${configPath}. Run 'mxclaw setup' to create one.`);
  }
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0] ?? "0");
  if (major >= 20) {
    ok.push(`Node.js ${nodeVersion} (>=20 required)`);
  } else {
    issues.push(`Node.js ${nodeVersion} is too old. Version 20+ required.`);
  }
  const workspaceDir = path15.join(os5.homedir(), ".mxclaw", "workspace");
  if (fs14.existsSync(workspaceDir)) {
    ok.push(`Workspace directory exists: ${workspaceDir}`);
  } else {
    warnings.push(`Workspace directory not yet created: ${workspaceDir} (will be created on first run)`);
  }
  const deps = ["docker", "git"];
  for (const dep of deps) {
    try {
      const { execSync: execSync2 } = await import("node:child_process");
      execSync2(`where ${dep}`, { stdio: "ignore" });
      ok.push(`${dep} is available`);
    } catch {
      warnings.push(`${dep} not found in PATH (optional, for sandbox/version control)`);
    }
  }
  console.log("\u2705 OK:");
  for (const o of ok) console.log(`  ${o}`);
  if (warnings.length > 0) {
    console.log("\n\u26A0\uFE0F  Warnings:");
    for (const w of warnings) console.log(`  ${w}`);
  }
  if (issues.length > 0) {
    console.log("\n\u274C Issues:");
    for (const i of issues) console.log(`  ${i}`);
  }
  console.log(`
Summary: ${ok.length} OK, ${warnings.length} warnings, ${issues.length} issues`);
});
program2.command("config").description("View or edit the mxclaw configuration").option("--show", "Show current config").option("--path", "Show config file path").option("--edit", "Open config in default editor").action(async (options) => {
  const configPath = getConfigPath();
  if (options.path) {
    console.log(configPath);
    return;
  }
  if (options.show) {
    if (!fs14.existsSync(configPath)) {
      console.log("No config found. Run 'mxclaw setup' first.");
      return;
    }
    const content = fs14.readFileSync(configPath, "utf-8");
    console.log(content);
    return;
  }
  if (options.edit) {
    const { exec: exec3 } = await import("node:child_process");
    const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === "win32" ? "notepad" : "vim");
    exec3(`${editor} "${configPath}"`);
    return;
  }
  console.log(`Config: ${configPath}`);
  console.log(`Exists: ${fs14.existsSync(configPath) ? "yes" : "no"}`);
});
program2.command("bind").description("Manage channel-to-agent bindings").option("--list", "List all bindings").option("--add <channelId>", "Add a binding for a channel").option("--sender <senderId>", "Sender ID for the binding").option("--agent <agentId>", "Agent ID for the binding", "default").option("--remove <index>", "Remove a binding by index").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    const bindings = config.bindings ?? [];
    console.log("Bindings:");
    if (bindings.length === 0) {
      console.log("  No bindings configured.");
    }
    bindings.forEach((b, i) => {
      console.log(`  [${i}] ${b.channelId}${b.senderId ? ` / ${b.senderId}` : ""} \u2192 ${b.agentId}`);
    });
  }
  if (options.add) {
    const binding = {
      channelId: options.add,
      senderId: options.sender,
      agentId: options.agent
    };
    config.bindings = [...config.bindings ?? [], binding];
    saveConfig(config);
    console.log(`Added binding: ${binding.channelId} \u2192 ${binding.agentId}`);
  }
  if (options.remove !== void 0) {
    const idx = parseInt(options.remove, 10);
    const bindings = [...config.bindings ?? []];
    if (idx >= 0 && idx < bindings.length) {
      const removed = bindings.splice(idx, 1);
      config.bindings = bindings;
      saveConfig(config);
      console.log(`Removed binding: ${removed[0]?.channelId} \u2192 ${removed[0]?.agentId}`);
    } else {
      console.error(`Invalid binding index: ${idx}`);
    }
  }
});
program2.parse();
