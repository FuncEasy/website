.PHONY: build
build:
	npm run build
	docker build --no-cache -t ziqiancheng/funceasy-website:latest .
	docker push ziqiancheng/funceasy-website:latest
clean:
	rm -rf ./build