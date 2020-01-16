layui.extend({}).define(['layer', 'upload'], function (exports) {
    var $ = layui.$,
        layer = layui.layer,
        upload = layui.upload,
        allUploaded = {},
        policy = null,
        uploadData = [],
        prefixPath,
        layerTitle,
        filesss = {},
        successCount = 0,
        uploadCount = 0,
        filesListView = null,
        multiple = false,
        multipleFileArray = [],
        multipleFileKeyArray = [],

        host = '',
        accessId = '',
        signature = '',
        maxSize = 0,

        uplaod = layui.upload;
    //加载样式

    var Class = function (options) {
        var that = this;
        that.options = options;
        that.init();
    };

    Class.prototype.init = function () {
        let that = this,
            options = that.options;

        let layerArea = !that.strIsNull(options.layerArea) ? options.layerArea : 'auto',
            layerTitle = !that.strIsNull(options.layerTitle) ? options.layerTitle : '上传文件到阿里云OSS',

            fileType = !that.strIsNull(options.fileType) ? options.fileType : 'file',
            policy = !that.strIsNull(options.policy) ? options.policy : '',

            accessId = !that.strIsNull(options.accessId) ? options.accessId : '',
            signature = !that.strIsNull(options.signature) ? options.signature : '',

            prefixPath = !that.strIsNull(options.prefixPath) ? options.prefixPath : '',

            uploadRenderData = !that.strIsNull(options.uploadRenderData) ? options.uploadRenderData : {};

        allUploaded[options.elm] = options.allUploaded;
        host = !that.strIsNull(options.host) ? options.host : '';
        multiple = !that.strIsNull(options.multiple) ? options.multiple : false;
        maxSize = !that.strIsNull(options.maxSize) ? options.maxSize : 2048;

        if (multiple) {
            $(options.elm).on('click', function () {
                layer.open({
                    type: 1,
                    area: layerArea, //宽高
                    resize: false,
                    title: layerTitle,
                    content: '<div class="layui-col-md12">' +
                        '<div class="layui-card">' +
                        '<div class="layui-card-body">' +
                        '<div class="layui-upload">' +
                        '<button type="button" class="layui-btn layui-btn-normal" id="test-upload-files">选择多文件</button>' +
                        '<div class="layui-upload-list">' +
                        '<table class="layui-table">' +
                        '<thead>' +
                        '<tr>' +
                        '<th>文件名</th>' +
                        '<th>大小</th>' +
                        '<th>状态</th>' +
                        '<th>操作</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody id="test-upload-filesList"></tbody>' +
                        '</table>' +
                        '</div>' +
                        '<button type="button" class="layui-btn" id="test-upload-filesAction">开始上传</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>',
                    success: function (layero, index) {
                        $('#test-upload-filesAction').on('click', function () {
                            if (typeof uploadListIns.config.files == 'undefined') {
                                layer.msg('请先选择要上传的文件!', {shade: 'rgba(0,0,0,0)'});
                                return;
                            }
                            layer.open({type: 3, icon: 1});
                            //先获取police信息

                            // 签名成功开始上传文件
                            var files = uploadListIns.config.files;
                            //清空原来返回的数组
                            uploadData = [];
                            var fileCount = 0;
                            for (var filekey in files) {
                                fileCount++;
                            }
                            let data = {};
                            data.signature = signature;
                            data.accessid = accessId;
                            data.policy = policy;
                            for (let filekey in files) {
                                var tr = filesListView.find('tr#upload-' + filekey),
                                    tds = tr.children();
                                if (tds.eq(2).text() == '等待上传') {
                                    that.uploadFile(files, filekey, fileCount, data);
                                } else {
                                    // successCount++;
                                    fileCount--;
                                    if (fileCount == 0) {
                                        layer.closeAll('loading');
                                        layer.msg('没有文件需要上传');
                                    }
                                }
                            }

                        }),
                            filesListView = $('#test-upload-filesList'),
                            uploadListIns = upload.render($.extend({
                                elem: '#test-upload-files',
                                url: host,
                                accept: fileType,
                                multiple: true,
                                size: maxSize,
                                auto: false,
                                choose: function (obj) {
                                    var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                                    //读取本地文件
                                    obj.preview(function (index, file, result) {
                                        var tr = $(['<tr id="upload-' + index + '">', '<td>' + file.name + '</td>', '<td>' + (file.size /
                                            1014).toFixed(
                                            1) + 'kb</td>', '<td>等待上传</td>', '<td>',
                                            '<button class="layui-btn layui-btn-mini test-upload-demo-reload layui-hide">重传</button>',
                                            '<button class="layui-btn layui-btn-mini layui-btn-danger test-upload-demo-delete">删除</button>',
                                            '</td>',
                                            '</tr>'
                                        ].join(''));

                                        //删除
                                        tr.find('.test-upload-demo-delete').on('click', function () {
                                            delete files[index]; //删除对应的文件
                                            tr.remove();
                                            uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                        });
                                        filesListView.append(tr);
                                    });
                                }
                            }, uploadRenderData));
                    } //可以自行添加按钮关闭,关闭请清空rowData
                    ,
                    end: function () {
                        if (options.success) {
                            if (typeof options.success === 'function') {
                                options.success();
                            }
                        }
                    }
                });
            })
        } else {
            upload.render($.extend({
                elem: options.elm,
                url: host,
                accept: fileType,
                multiple: false,
                size: maxSize,
                auto: false,
                choose: function (obj) {
                    layer.open({type: 3, icon: 1});
                    var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列

                    if (JSON.stringify(filesss) == '{}') {
                        filesss = JSON.parse(JSON.stringify(files));

                    } else {
                        for (var file in files) {
                            if (file in filesss) {
                                delete files[file];
                            }
                        }
                        filesss = JSON.parse(JSON.stringify(files));
                    }
                    //读取本地文件
                    successCount = 0;
                    // 签名成功开始上传文件
                    let data = {};
                    data.signature = signature;
                    data.accessid = accessId;
                    data.policy = policy;

                    for (var filekey in files) {
                        that.uploadFile(files, filekey, 1, data);
                    }

                }
            }, uploadRenderData));
        }
    };


    Class.prototype.strIsNull = function (str) {
        if (typeof str == "undefined" || str == null || str == "")
            return true;
        else
            return false;
    };


    Class.prototype.uploadFile = function (files, filekey, fileCount, data) {
        let multipleState = this.options.multiple;
        multipleFileArray.push(files[filekey]);
        data.file = files[filekey];
        let fileData = new FormData();
        multipleFileKeyArray.push(this.options.prefixPath + new Date().getTime() + '-' + (Math.random() + "").substring(2, 7) + '-' + data.file.name);
        fileData.append('key', multipleFileKeyArray[uploadCount]);
        fileData.append('policy', data.policy);
        fileData.append('OSSAccessKeyId', data.accessid);
        fileData.append('signature', data.signature);
        fileData.append('success_action_status', 200);
        fileData.append('file', multipleFileArray[uploadCount]);

        uploadCount++;
        let upfiles = filesss,
            that = this;

        $.ajax({
            url: host,
            processData: false,
            cache: false,
            contentType: false,
            type: 'POST',
            data: fileData,
            success: function (r) {
                let result = {
                    name: multipleFileArray[successCount].name,
                    type: multipleFileArray[successCount].type,
                    ossUrl: host + '/' + multipleFileKeyArray[successCount]
                };
                //成功无返回
                if (multipleState) {
                    uploadData.push(result);
                    var tr = filesListView.find('tr#upload-' + filekey),
                        tds = tr.children();
                    tds.eq(2).html('<span style="color: #5FB878;">上传成功</span>');
                    tds.eq(3).html(''); //清空操作
                } else {
                    uploadData = [result];
                    delete upfiles[0];
                }
                successCount++;
                if (successCount == fileCount) {
                    successCount = 0;
                    fileCount = 0;
                    uploadCount = 0;
                    multipleFileArray = [];
                    multipleFileKeyArray = [];
                    layer.closeAll('loading');

                    if (multipleState) {
                        allUploaded[that.options.elm](uploadData);
                    } else {
                        allUploaded[that.options.elm](uploadData[0]);
                    }
                }
            },
            error: function (i) {
                console.log(i)
            }
        })
    };

    Class.prototype.removeArray = function (array, fileId) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].fileId == fileId) {
                array.splice(i, 1);
            }
        }
        return array;
    };

    var aliossUploader = {
        render: function (options) {
            var inst = new Class(options);
            return inst;
        }

    };

    exports('aliossUploader', aliossUploader);
});
