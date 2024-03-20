# Kulmio development service runner

Basic syntax:

    kulmio configfile command arguments
    kulmio configfile command arguments services

If environment variable KULMIO_CONFIG is set, you do not need to be explicit about the config file.

    kulmio command arguments

If automatic detection logic fails, you can explicitly indicate that KULMIO_CONFIG is to be usd by
using `--env` as the configfile

    kulmio --env command arguments

For convenience, command can be at the end of the command line instead of its usual location. That is,
the following two do the same thing:

    kulmio start servicename
    kulmio servicename start

If a service name matches the name of a command, it is assumed that the command comes before
service names.

## Dependencies

- nodejs
- pgrep

## Installing

    npm i -g kulmio

## Commands

In the examples is is assumed that the environment variable KULMIO_CONFIG is set to the config file.

### status

Outputs the status of all the services in the config

    kulmio status

### build

Runs the build commands specified for the services

    kulmio build service
    kulmio build service1 service2 service3

### start

Starts a background service

    kulmio start service
    kulmio start service1 service2 service3

### run

Runs a service in the current terminal.

    kulmio run service

All the services are run in a screen, allowing you to do the usual screen things

### stop

Stops services

    kulmio stop service
    kulmio stop service1 service2 service3

### restart

Restarts services

    kulmio restart service
    kulmio restart service1 service2 service3

### logs

Displays service logs

    kulmio logs service
    kulmio logs service1 service2 service3
    kulmio logs -f service

Arguments to logs are passed as parameters to tail, so anything supported by tail can be used.

### screen

Access the screen of a running service

    kulmio screen service
