layui.define(['view', 'table', 'aliossUploader', 'sentry'], function (exports) {

        let $ = layui.jquery,
            view = layui.view,
            setter = layui.setter,
            laytpl = layui.laytpl,
            LAY_BODY = 'LAY_app_body',
            // upload = layui.aliossUploader,
            sentry = layui.sentry,
            table = layui.table;

        sentry.init(setter.sentry);

        sentry.configureScope(function (scope) {
            scope.setExtra("user_id", "10086");
            scope.setExtra("phone", "13800138000");
        });

        function empty(str) {
            return (typeof str === "undefined" || str == null || str === "");
        }

        let Class = function (id, hyperf) {
                this.id = id;
                this.container = $('#' + (id || LAY_BODY));
                this.hyperf = hyperf;
            },
            Hyperf = function (id) {
                this.id = id;
                this.container = $('#' + (id || LAY_BODY));
                let hyperf = this;

                this.msg = {
                    /**
                     *
                     * @param content
                     * @param options
                     * @param callback
                     * @returns {*}
                     */
                    dialog: function (content, options, callback) {
                        return layer.msg(content || '请填写需要显示的内容', options, typeof callback === 'function' ? callback : '');
                    },
                    /**
                     *
                     * @param content
                     * @param callback
                     * @returns {*}
                     */
                    warning: function (content, callback) {
                        return this.dialog(content, {icon: 7}, callback);
                    },
                    /**
                     *
                     * @param content
                     * @param callback
                     * @returns {*}
                     */
                    success: function (content, callback) {
                        return this.dialog(content, {icon: 6}, callback);
                    },
                    /**
                     *
                     * @param content
                     * @param callback
                     * @returns {*}
                     */
                    error: function (content, callback) {
                        return this.dialog(content, {icon: 5}, callback);
                    },
                    toast: function (content) {
                        return this.dialog(content, {}, false);
                    }
                };

                this.confirm = function (content, yes, no, options) {
                    return layer.confirm(content || '请填写提示的内容', $.extend({
                        btn: ['确定', '取消'],
                        icon: 3,
                        title: '提示'
                    }, options), yes, no);
                };

                this.alert = function (content, callback, options) {
                    return layer.alert(content || '请填写提示的内容', $.extend({
                        // icon: 1,
                        title: '提示'
                    }, options), callback);
                };

                this.open = function (content, success, options) {
                    return layer.open($.extend({
                        content: content || '请填写提示的内容',
                        title: '提示',
                        fixed: false,
                        move: false,
                        success: function (layero, index) {
                            'function' === typeof success && success(layero, index);
                        }
                    }, options));
                }

                this.loading = function () {
                    return layer.load(3, {
                        shade: [0.1, '#fff'] //0.1透明度的白色背景
                    });
                };

                this.prompt = function (title, success, options) {
                    let that = this;
                    return layer.prompt($.extend({
                            formType: 2,
                            value: '',
                            title: title || '请输入标题',
                            placeholder: '',
                            maxlength: 100,
                            area: ['250px', '150px'], //自定义文本域宽高
                        }, options),
                        function (value, index, elem) {
                            typeof success === 'function' && success.call(that, ...arguments);
                        }
                    );
                };

                this.close = function (index) {
                    return layer.close(index);
                };

                this.http = {
                    request: function (options) {
                        let that = this
                            , success = options.success
                            , error = options.error
                            , request = setter.request
                            , response = setter.response
                            , retries = retriesClone = request.retries
                        ;
                        options.data = options.data || {};
                        options.headers = options.headers || {};
                        let path = options.url;
                        options.url = setter.api + path;

                        if (request.tokenName) {
                            let sendData = typeof options.data === 'string'
                                ? JSON.parse(options.data)
                                : options.data;

                            //自动给 Request Headers 传入 token
                            let layuiData = layui.data(setter.tableName);
                            options.headers[request.tokenName] = request.tokenName in options.headers
                                ? options.headers[request.tokenName]
                                : (layuiData ? layuiData[request.tokenName] || '' : '');
                        }

                        delete options.success;
                        delete options.error;

                        let index = options.loading !== false && hyperf.loading();

                        return $.ajax($.extend({
                            type: 'GET'
                            , dataType: 'json'
                            , crossDomain: true
                            , success: function (res) {
                                //http请求成功回调
                                let statusCode = response.statusCode;
                                //只有 response 的 code 一切正常才执行 done
                                if (res[response.statusName] == statusCode.ok) {
                                    typeof options.done === 'function' && options.done(res);
                                } else if (res[response.statusName] == statusCode.no) {
                                    sentry.configureScope(function (scope) {
                                        scope.setFingerprint([options.type, path, statusCode.no]);
                                        scope.setExtra("options", options);
                                    });
                                    sentry.captureMessage(JSON.stringify(res));

                                    typeof error === 'function' && error(res);

                                    return false;
                                }
                                //登录状态失效，清除本地 access_token，并强制跳转到登入页
                                else if (res[response.statusName] == statusCode.logout) {
                                    view.exit();
                                } else {
                                    hyperf.msg.error(res.msg);//res.code > 0  一般为逻辑性错误
                                    return false;
                                }
                                //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
                                typeof success === 'function' && success(res);
                            }
                            , error: function (e, code) {
                                //http异常回调
                                hyperf.msg.error('网络请求异常' + code);
                                setter.debug && console.error("Error: %s (%i) URL:%s", e.statusText, e.status, options.url);

                                sentry.configureScope(function (scope) {
                                    scope.setFingerprint([options.type, path, code]);
                                    scope.setLevel('error');
                                    scope.setExtra("options", options);
                                    scope.setExtra("code", code);
                                });
                                sentry.captureMessage(JSON.stringify(e));
                            }, complete: function (XHR) {
                                index && layer.close(index);
                            }
                        }, options));

                    },
                    post: function (options) {
                        this.request($.extend({
                            error: function (res) {
                                hyperf.msg.error(res.msg);
                            }
                        }, options, {'type': 'POST'}));
                    },
                    get: function (options) {
                        this.request($.extend({
                            error: function (res) {
                                hyperf.msg.error(res.msg);
                            }
                        }, options, {'type': 'GET'}));
                    },
                    /**
                     * 表单自动处理
                     * @param obj
                     * @param options
                     */
                    auto: function (obj, options) {

                        let form = obj.form;
                        if (empty(form)) {
                            console.error('请设置form属性');
                            return false;
                        }

                        let m = form.attributes.method,
                            a = form.attributes.action;

                        let method = empty(m) ? 'GET' : (empty(m.nodeValue) ? 'POST' : m.nodeValue),
                            action = empty(a) ? '' : (empty(empty(a.nodeValue)) ? '' : a.nodeValue);

                        if (empty(action)) {
                            console.error('请填写form的action属性');
                            return false;
                        }

                        this.request($.extend({
                            url: form.attributes.action.nodeValue,
                            method: method,
                            data: obj.field
                        }, $.extend({
                            done: function (res) {
                                hyperf.msg.success(res.msg);
                            },
                            error: function (res) {
                                hyperf.msg.error(res.msg);
                            }
                        }, options)));
                    }
                };
                /**
                 * 图片
                 * @type {{album: album, one: (function(*=, *=): (*|void))}}
                 */
                this.photo = {
                    //单张图片显示
                    one: function (src, options) {
                        return this.album([{
                            src: src
                        }], options);
                    },
                    //多张张图片显示
                    album: function (data, options) {
                        layer.photos($.extend({
                            photos: {
                                data: data
                            }
                            , shade: 0.01//背景透明度
                            , closeBtn: 1//是否显示关闭按钮
                            , anim: 5//图片入场方式
                        }, options));
                    }
                };
                /**
                 * 表格
                 * @type {{checkStatus: (function(*=): *), t: (function(*=): (jQuery|any|{})), render: (function(*=): *)}}
                 */
                this.table = {
                    checkStatus: function (id) {
                        return table.checkStatus(id);
                    },
                    render: function (options) {
                        return table.render(this.t(options))
                    },
                    // reload: function (id, options) {
                    //     return table.reload(id, this.t(options))
                    // },
                    t: function (options) {
                        //拼装headers信息
                        let request = setter.request,
                            headers = {};
                        options.url = setter.api + options.url;
                        headers[request.tokenName] = (layui.data(setter.tableName)[request.tokenName] || '');

                        return $.extend({
                            headers: headers,
                            text: {
                                none: '暂无相关数据'
                            },
                            page: true
                        }, options);
                    }
                };
                /**
                 * 弹层
                 * @param options
                 * @returns {Class.index}
                 */
                this.popup = function (options) {
                    let success = options.success
                        , skin = options.skin;
                    delete options.success;
                    delete options.skin;

                    return layer.open($.extend({
                        type: 1
                        , title: '提示'
                        , content: ''
                        , id: 'LAY-system-view-popup'
                        , skin: 'layui-layer-admin' + (skin ? ' ' + skin : '')
                        , shadeClose: true
                        , closeBtn: false
                        , success: function (layero, index) {
                            let elemClose = $('<i class="layui-icon" close>&#x1006;</i>');
                            layero.append(elemClose);
                            elemClose.on('click', function () {
                                // layer.close(index);
                                hyperf.close(index);
                            });
                            typeof success === 'function' && success.apply(this, arguments);
                        }
                    }, options))
                };
                /**
                 * 页面处理
                 * @type {{refreshAll: refreshAll, forward: forward, refresh: refresh, back: back, href: href}}
                 */
                this.page = {
                    href: function (href) {
                        location.hash = href;
                    },
                    refresh: function () {
                        layui.index.render();
                    },
                    refreshAll: function () {
                        location.reload();
                    },
                    back: function () {
                        history.back();
                    },
                    forward: function () {
                        history.forward();
                    }
                };
                /**
                 * 自动处理
                 * @type {{api: api, info: info}}
                 */
                this.auto = {
                    info: function (options) {
                        if (!(options.hasOwnProperty('data') && options.hasOwnProperty('url') && options.hasOwnProperty('title') && options.hasOwnProperty('view'))) {
                            hyperf.msg.error('参数缺失！');
                            return false;
                        }

                        let success = options.success;
                        let d = options.data;

                        delete options.success;

                        return hyperf.popup($.extend({
                            title: '弹窗'
                            , area: ['600px', '480px']
                            , id: 'LAY-popup-user-add'
                            , success: function (layero, index) {
                                let viewIndex = this.id;
                                hyperf.view(viewIndex).render(options.view).done(function (r) {
                                    hyperf.http.get({
                                        url: options.url,
                                        data: d,
                                        done: function (res) {
                                            typeof success === 'function' && success.apply(this, arguments);
                                        }
                                    });
                                });
                            }
                        }, options));
                    },
                    api: function (url, id) {
                        hyperf.http.post({
                            url: url,
                            data: {
                                id: id
                            },
                            success: function (res) {
                                hyperf.msg.success(res.msg, function () {
                                    hyperf.page.refresh();
                                });
                            }
                        });
                    }
                };

                this.view = function (id) {
                    return new Class(id, this);
                }
            };

        //请求模板文件渲染
        Class.prototype.render = function (views, params) {
            var that = this, router = layui.router();
            views = setter.views + views + setter.engine;

            $('#' + LAY_BODY).children('.layadmin-loading').remove();
            //请求模板
            $.ajax({
                url: views
                , type: 'get'
                , dataType: 'html'
                , data: {
                    v: layui.cache.version
                }
                , success: function (html) {
                    html = '<div>' + html + '</div>';
                    let $html = $(html);
                    var elemTitle = $html.find('title')
                        , title = elemTitle.text() || (html.match(/\<title\>([\s\S]*)\<\/title>/) || [])[1];

                    var res = {
                        title: title
                        , body: html
                    };

                    elemTitle.remove();
                    that.params = params || {}; //获取参数

                    if (that.then) {
                        that.then(res);
                        delete that.then;
                    }

                    that.parse(html);
                    // view.removeLoad();

                    if (that.done) {
                        that.done(res);
                        delete that.done;
                    }

                }
                , error: function (e) {
                    // view.removeLoad();
                    if (e.status === 404) {
                        // that.render('template/tips/404');
                        that.hyperf.page.href('/template/tips/404');
                    } else {
                        that.hyperf.page.href('/template/tips/error');
                        // that.render('template/tips/error');
                    }

                    sentry.configureScope(function (scope) {
                        // scope.setFingerprint([options.type, path, code]);
                        scope.setLevel('error');
                    });
                    sentry.captureMessage(views + '模板不存在');

                    that.render.isError = true;
                }
            });
            return that;
        };

        //解析模板
        Class.prototype.parse = function (html, refresh, callback) {

            let that = this
                , isScriptTpl = typeof html === 'object' //是否模板元素
                , elem = isScriptTpl ? html : $(html)
                , elemTemp = isScriptTpl ? html : elem.find('*[template]')
                , fn = function (options) {
                let tpl = laytpl(options.dataElem.html())
                    , res = $.extend({
                    params: router.params
                }, options.res);

                options.dataElem.after(tpl.render(res));
                typeof callback === 'function' && callback();

                try {
                    options.done && new Function('d', options.done)(res);
                } catch (e) {
                    console.error(options.dataElem[0], '\n存在错误回调脚本\n\n', e);

                    sentry.configureScope(function (scope) {
                        // scope.setFingerprint([options.type, path, code]);
                        scope.setLevel('error');
                        scope.setExtra("options", options);
                        scope.setExtra("router", router);
                    });
                    sentry.captureMessage(router + '存在错误回调脚本');
                }
            }
                , router = layui.router();

            elem.find('title').remove();
            that.container[refresh ? 'after' : 'html'](elem.children());

            router.params = that.params || {};

            //遍历模板区块
            for (let i = elemTemp.length; i > 0; i--) {
                (function () {
                    let dataElem = elemTemp.eq(i - 1)
                        , layDone = dataElem.attr('lay-done') || dataElem.attr('lay-then') //获取回调
                        , url = laytpl(dataElem.attr('lay-url') || '').render(router) //接口 url
                        , data = laytpl(dataElem.attr('lay-data') || '').render(router) //接口参数
                        , headers = laytpl(dataElem.attr('lay-headers') || '').render(router); //接口请求的头信息

                    try {
                        data = new Function('return ' + data + ';')();
                    } catch (e) {
                        console.error('lay-data: ' + e.message);
                        data = {};
                    }

                    try {
                        headers = new Function('return ' + headers + ';')();
                    } catch (e) {
                        console.error('lay-headers: ' + e.message);
                        headers = headers || {}
                    }

                    if (url) {

                        if (null === url.match(/\.(jpg|png|jpeg|json|html|htm)[?&]?/g)) {
                            url = setter.api + url;
                        }

                        view.req({
                            type: dataElem.attr('lay-type') || 'get'
                            , url: url
                            , data: data
                            , dataType: 'json'
                            , headers: headers
                            , success: function (res) {
                                fn({
                                    dataElem: dataElem
                                    , res: res
                                    , done: layDone
                                });
                            }
                        });
                    } else {
                        fn({
                            dataElem: dataElem
                            , done: layDone
                        });
                    }
                }());
            }

            return that;
        };

        //直接渲染字符
        Class.prototype.send = function (views, data) {
            let tpl = laytpl(views || this.container.html()).render(data || {});
            this.container.html(tpl);
            return this;
        };

        //局部刷新模板
        Class.prototype.refresh = function (callback) {
            let that = this
                , next = that.container.next()
                , templateid = next.attr('lay-templateid');

            if (that.id != templateid) return that;

            that.parse(that.container, 'refresh', function () {
                that.container.siblings('[lay-templateid="' + that.id + '"]:last').remove();
                typeof callback === 'function' && callback();
            });

            return that;
        };

        //视图请求成功后的回调
        Class.prototype.then = function (callback) {
            this.then = callback;
            return this;
        };

        //视图渲染完毕后的回调
        Class.prototype.done = function (callback) {
            this.done = callback;
            return this;
        };

        let my = new Hyperf(),
            events = {
                /**
                 * 删除
                 * @param self
                 */
                del: function (self) {
                    let that = $(self),
                        url = that.attr('hyperf-url') || '',
                        id = that.attr('hyperf-del') || '';
                    my.confirm('确定删除吗？', function (index) {
                        id && url && my.auto.api(url, id);
                    });
                },
                /**
                 * 禁用
                 * @param self
                 */
                forbid: function (self) {
                    let that = $(self),
                        url = that.attr('hyperf-url') || '',
                        id = that.attr('hyperf-forbid') || '';

                    id && url && my.auto.api(url, id);
                },
                /**
                 * 启用
                 * @param self
                 */
                resume: function (self) {
                    let that = $(self),
                        url = that.attr('hyperf-url') || '',
                        id = that.attr('hyperf-resume') || '';
                    id && url && my.auto.api(url, id);
                },
                /**
                 * 图片预览
                 * @param othis
                 */
                preview: function (othis) {

                    let src = $(othis).attr('hyperf-preview');
                    if (!src) {
                        // console.log('图片地址为空');
                        return false;
                    }

                    my.photo.one(src);
                },
                /**
                 * 相册
                 * @param othis
                 * @returns {boolean}
                 */
                album: function (othis) {
                    console.log($(othis).attr('hyperf-album'));

                    let src = $(othis).attr('hyperf-album');
                    if (!src) {
                        // console.log('图片地址为空');
                        return false;
                    }

                    my.photo.album(src);
                },
            },
            $body = $('body');

        $body.on('click', '[hyperf-del]', function () {
            events['del'] && events['del'].call(this, this);
        }).on('click', '[hyperf-forbid]', function () {
            events['forbid'] && events['forbid'].call(this, this);
        }).on('click', '[hyperf-resume]', function () {
            events['resume'] && events['resume'].call(this, this);
        }).on('click', '[hyperf-load]', function () {
            my.page.href(this);
        }).on('click', '[hyperf-refresh]', function () {
            my.page.refresh();
        }).on('click', '[hyperf-back]', function () {
            my.page.back();
        }).on('click', '[hyperf-forward]', function () {
            my.page.forward();
        }).on('click', '[hyperf-preview]', function () {
            events['preview'] && events['preview'].call(this, this);
            return false;
        }).on('click', '[hyperf-album]', function () {
            events['album'] && events['album'].call(this, this);
        });


        $.fn.uploadOneImage = function (cb) {
            var name = $(this).attr('name') || 'image', type = $(this).data('type') || 'png,jpg,gif';
            var $tpl = $('<a data-file="btn" class="uploadimage"></a>').attr('data-field', name).attr('data-type', type);
            let that = this;

            let self =
                $(this).attr('name', name).after($tpl.data('input', this)).on('change', function () {
                    if (this.value) $tpl.css('backgroundImage', 'url(' + this.value + ')');
                }).trigger('change');

            my.http.get({
                url: '/plugin/upload/getOss',
                loading: false,
                done: function (res) {
                    let {accessKeyId, dir, host, maxSize, policy, signature} = res.data;
                    layui.use('aliossUploader', function () {
                        let upload = layui.aliossUploader;
                        upload.render({
                            elm: that,
                            host: host,
                            layerTitle: '上传数据文件',
                            accessId: accessKeyId,
                            policy: policy,
                            signature: signature,
                            prefixPath: dir,
                            maxSize: maxSize,
                            fileType: 'images',
                            multiple: false,
                            allUploaded: function (res) {
                                console.log(res);
                                // avatarSrc.val(res.ossUrl);
                                // avatarPreview.attr('hyperf-preview', res.ossUrl);
                            }
                        });
                    });
                }
            });
        };

        exports('hyperf', my);
    }
);

