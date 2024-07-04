const Sentry = require("@sentry/node");

function sentryAppender(levels) {
    return (loggingEvent) => {

        const lvl = new levels(loggingEvent.level.level, loggingEvent.level.levelStr, loggingEvent.level.colour);

        if (lvl.isGreaterThanOrEqualTo(levels.WARN)) {
            const sorted = loggingEvent.data.reduce((acc, event) => {
                if (event instanceof Error) {
                    acc.unshift(event);
                } else {
                    acc.push(event);
                }

                return acc;
            }, []);

            const [head, ...rest] = sorted;

            Sentry.withScope(scope => {
                scope.setExtra("extra", rest);
                if (typeof head === "string") {
                    Sentry.captureMessage(head);
                } else {
                    Sentry.captureException(head);
                }
            });
        }
    };
}

function configure(config, _layouts, _, levels) {
    if (!config.dsn) {
        throw new Error("DSN for sentryAppender is not provided.");
    }

    Sentry.init({
        dsn: config.dsn,
    });

    return sentryAppender(levels);
}

exports.configure = configure;
