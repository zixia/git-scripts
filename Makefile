
MOCHA_OPTS = --check-leaks --bail
REPORTER = dot

build:
	@cp ./bin/hooks/hook ./bin/hooks/applypatch-msg
	@cp ./bin/hooks/hook ./bin/hooks/pre-applypatch
	@cp ./bin/hooks/hook ./bin/hooks/post-applypatch
	@cp ./bin/hooks/hook ./bin/hooks/pre-commit
	@cp ./bin/hooks/hook ./bin/hooks/prepare-commit-msg
	@cp ./bin/hooks/hook ./bin/hooks/commit-msg
	@cp ./bin/hooks/hook ./bin/hooks/post-commit
	@cp ./bin/hooks/hook ./bin/hooks/pre-rebase
	@cp ./bin/hooks/hook ./bin/hooks/post-checkout
	@cp ./bin/hooks/hook ./bin/hooks/post-merge
	@cp ./bin/hooks/hook ./bin/hooks/pre-receive
	@cp ./bin/hooks/hook ./bin/hooks/update
	@cp ./bin/hooks/hook ./bin/hooks/post-receive
	@cp ./bin/hooks/hook ./bin/hooks/post-update
	@cp ./bin/hooks/hook ./bin/hooks/pre-auto-gc
	@cp ./bin/hooks/hook ./bin/hooks/post-rewrite

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

.PHONY: build test
