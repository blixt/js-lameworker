# LAME library options
LAME_VERSION:=3.99.5
LAME:=lame-$(LAME_VERSION)
LAME_URL:="http://downloads.sourceforge.net/project/lame/lame/3.99/$(LAME).tar.gz"
TAR:=tar

# JavaScript tools
CLOSURE_COMPILER:=java -jar node_modules/google-closure-compiler/compiler.jar
CLOSURE_COMPILER_OPTIONS:=--language_in ECMASCRIPT5 -W QUIET
BROWSERIFY:=node_modules/.bin/browserify
DEREQUIRE:=node_modules/.bin/derequire

# Emscripten options
EMCC:=emcc
# LAME functions to make available in JavaScript.
EMCC_EXPORTED_FUNCTIONS:=[\
'_get_lame_version',\
'_lame_close',\
'_lame_encode_buffer_ieee_float',\
'_lame_encode_flush',\
'_lame_get_brate', '_lame_set_brate',\
'_lame_get_in_samplerate', '_lame_set_in_samplerate',\
'_lame_get_mode', '_lame_set_mode',\
'_lame_get_num_channels', '_lame_set_num_channels',\
'_lame_get_num_samples', '_lame_set_num_samples',\
'_lame_get_out_samplerate', '_lame_set_out_samplerate',\
'_lame_get_VBR', '_lame_set_VBR',\
'_lame_get_VBR_max_bitrate_kbps', '_lame_set_VBR_max_bitrate_kbps',\
'_lame_get_VBR_mean_bitrate_kbps', '_lame_set_VBR_mean_bitrate_kbps',\
'_lame_get_VBR_min_bitrate_kbps', '_lame_set_VBR_min_bitrate_kbps',\
'_lame_get_VBR_q', '_lame_set_VBR_q',\
'_lame_init', '_lame_init_params']
EMCC_OPTIONS:=-O3 --closure 0 --memory-init-file 0 -s NO_FILESYSTEM=1 -s NO_BROWSER=1 -s LINKABLE=1 -s USE_CLOSURE_COMPILER=1 -s EXPORTED_FUNCTIONS="$(EMCC_EXPORTED_FUNCTIONS)"
EMCONFIGURE:=emconfigure
EMMAKE:=emmake

# Output options
DIST_JS:=dist/lame.js
DIST_WORKER_JS:=dist/lame.worker.js
LIB_JS:=libmp3lame.js

all: $(DIST_JS) $(DIST_WORKER_JS)

$(DIST_JS): index.js node_modules
	$(BROWSERIFY) -s lameworker $< | $(DEREQUIRE) | $(CLOSURE_COMPILER) $(CLOSURE_COMPILER_OPTIONS) > $@

$(DIST_WORKER_JS): worker.js $(LIB_JS) node_modules
	$(BROWSERIFY) --bare $< | $(CLOSURE_COMPILER) $(CLOSURE_COMPILER_OPTIONS) > $@

$(LIB_JS): $(LAME) pre.js post.js
	$(EMCC) $(EMCC_OPTIONS) --pre-js pre.js --post-js post.js $(wildcard $(LAME)/libmp3lame/*.o) -o $@

$(LAME): $(LAME).tar.gz
	$(TAR) xzvf $@.tar.gz && \
	cd $@ && \
	sed -i -e '/xmmintrin\.h/d' configure && \
	$(EMCONFIGURE) ./configure --disable-frontend && \
	$(EMMAKE) make

$(LAME).tar.gz:
	test -e "$@" || wget $(LAME_URL)

node_modules: package.json
	npm install

clean:
	$(RM) $(DIST_JS) $(DIST_WORKER_JS) $(LIB_JS) $(LIB_JS_MIN)
	$(RM) -r $(LAME)

distclean: clean
	$(RM) $(LAME).tar.gz
	$(RM) -r node_modules

.PHONY: clean distclean
