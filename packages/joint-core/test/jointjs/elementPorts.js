QUnit.module('element ports', function() {

    var Model = joint.dia.Element.extend({
        useCSSSelectors: true,
        markup: '<g class="rotatable"><g class="scalable"><rect class="rectangle"/></g><text/></g>',
        portMarkup: '<circle class="circle-port" />',
        defaults: _.defaultsDeep({
            type: 'test-model'

        }, joint.dia.Element.prototype.defaults)
    });

    var create = function(initialPorts) {

        return new Model({
            ports: initialPorts
        });
    };

    QUnit.module('port collection operations', function() {

        QUnit.test('simple getters/setters', function(assert) {

            var shape = create();
            assert.equal(shape.getPorts().length, 0);

            var portDefinition = {
                id: 'first'
            };

            shape.addPort(portDefinition);
            assert.equal(shape.getPorts().length, 1);

            var p2 = {
                id: 'second'
            };

            var p3 = {
                id: 'third'
            };

            shape.addPorts([p2, p3]);
            assert.equal(shape.getPorts().length, 3);
            assert.equal(shape.getPorts()[0].id, 'first');
        });

        QUnit.test('initial ports', function(assert) {

            var shape = create({ items: [{ 'group': 'in' }] });
            assert.equal(shape.getPorts().length, 1);
        });

        QUnit.test('addPorts', function(assert) {

            var shape = create({ items: [{ group: 'in' }] });

            var eventOrder = ['ports:add', 'change:ports', 'change'];

            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.addPort({ id: 'a' });
            assert.equal(shape.getPorts().length, 2);
            assert.equal(shape.getPorts()[1].id, 'a');
            assert.ok(typeof shape.getPorts()[0].id === 'string');
        });

        QUnit.test('insertPort by index', function(assert) {

            var shape = create({ items: [{ group: 'in' }] });

            var eventOrder = ['ports:add', 'change:ports', 'change'];

            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.insertPort(0, { id: 'a' });

            assert.equal(shape.getPorts().length, 2);
            assert.equal(shape.getPorts()[0].id, 'a');
            assert.ok(typeof shape.getPorts()[1].id === 'string');
        });

        QUnit.test('insertPort by port', function(assert) {

            var shape = create({ items: [{ group: 'in' }] });

            shape.insertPort(shape.getPorts()[0], { id: 'a' });

            assert.equal(shape.getPorts().length, 2);
            assert.equal(shape.getPorts()[0].id, 'a');
            assert.ok(typeof shape.getPorts()[1].id === 'string');
        });

        QUnit.test('insertPort by id', function(assert) {

            var shape = create({ items: [{ group: 'in' }] });

            shape.insertPort(0, { id: 'a' });
            shape.insertPort('a', { id: 'b' });

            assert.equal(shape.getPorts().length, 3);
            assert.equal(shape.getPorts()[0].id, 'b');
            assert.equal(shape.getPorts()[1].id, 'a');
            assert.ok(typeof shape.getPorts()[2].id === 'string');
        });

        QUnit.test('remove port - by object', function(assert) {

            var shape = create({ items: [{ id: 'aaa', 'group': 'in' }, { id: 'xxx', 'group': 'in' }] });

            var eventOrder = ['ports:remove', 'change:ports', 'change'];
            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.removePort(shape.getPort('aaa'));
            assert.equal(shape.getPorts().length, 1);
            assert.equal(shape.getPorts()[0].id, 'xxx');
        });

        QUnit.test('remove port - by id', function(assert) {

            var shape = create({ items: [{ id: 'aaa', 'group_id': 'in' }, { id: 'xxx', 'group_id': 'in' }] });

            var eventOrder = ['ports:remove', 'change:ports', 'change'];
            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.removePort('aaa');
            assert.equal(shape.getPorts().length, 1);
            assert.equal(shape.getPorts()[0].id, 'xxx');
        });

        QUnit.test('remove port - invalid reference - should not remove any port', function(assert) {

            var shape = create({ items: [{ id: 'aaa', 'group_id': 'in' }, { id: 'xxx', 'group_id': 'in' }] });

            shape.removePort();
            assert.equal(shape.getPorts().length, 2);

            shape.removePort('non-existing-port');
            assert.equal(shape.getPorts().length, 2);
        });

        QUnit.test('removePorts', function(assert) {

            var shape = create({ items: [
                { id: 'aaa', 'group_id': 'in' },
                { id: 'bbb', 'group_id': 'in' },
                { id: 'xxx', 'group_id': 'in' }
            ] });

            var eventOrder = ['ports:remove', 'change:ports', 'change'];

            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.removePorts([{ id: 'aaa' }, { id: 'bbb' }]);
            assert.equal(shape.getPorts().length, 1);
            assert.equal(shape.getPorts()[0].id, 'xxx');
        });

        QUnit.test('removePorts - invalid reference - should not remove them', function(assert) {

            var shape = create({ items: [
                { id: 'aaa', 'group_id': 'in' },
                { id: 'bbb', 'group_id': 'in' },
                { id: 'xxx', 'group_id': 'in' }
            ] });

            var eventOrder = ['ports:remove', 'change:ports', 'change'];

            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.removePorts([{ id: 'aaa' }, { id: 'ddd' }]);
            assert.equal(shape.getPorts().length, 2);
            assert.equal(shape.getPorts()[0].id, 'bbb');
            assert.equal(shape.getPorts()[1].id, 'xxx');
        });

        QUnit.test('removePorts - should remove all ports when only given options', function(assert) {

            var shape = create({ items: [
                { id: 'aaa', 'group_id': 'in' },
                { id: 'bbb', 'group_id': 'in' },
                { id: 'xxx', 'group_id': 'in' }
            ] });

            var eventOrder = ['ports:remove', 'change:ports', 'change'];

            shape.on('all', function(eventName) {
                assert.equal(eventName, eventOrder.shift());
            });

            shape.removePorts();
            assert.equal(shape.getPorts().length, 0);
        });

        QUnit.test('getPortIndex', function(assert) {

            var idObject = {};
            var ports = [
                {},
                { id: 'aaa', 'group_id': 'in' },
                { id: 'xxx', 'group_id': 'in' },
                { x: 'whatever' },
                { id: '' },
                { id: 0 },
                { id: false },
                { id: true },
                { id: idObject }
            ];
            var shape = create({ items: ports });

            assert.equal(shape.getPortIndex('xxx'), 2);
            assert.equal(shape.getPortIndex(ports[1]), 1);
            assert.equal(shape.getPortIndex(), -1);
            assert.equal(shape.getPortIndex(null), -1);
            assert.equal(shape.getPortIndex(undefined), -1);
            assert.equal(shape.getPortIndex(''), 4);
            assert.equal(shape.getPortIndex(0), 5);
            assert.equal(shape.getPortIndex(false), 6);
            assert.equal(shape.getPortIndex(true), 7);
            assert.equal(shape.getPortIndex(idObject), -1);
        });

        QUnit.test('initialized with no ports', function(assert) {

            var shape = create();
            assert.equal(shape.getPorts().length, 0);
        });

        QUnit.module('ids', function() {

            QUnit.test('duplicate id', function(assert) {

                assert.throws(function() {
                    create({ items: [{ 'group_id': 'in' }, { id: 'a' }, { id: 'a' }] });
                }, function(err) {
                    return err.toString().indexOf('duplicities') !== -1;
                });

            });

            QUnit.test('duplicate id - add port', function(assert) {

                var shape = create({ items: [{ id: 'a' }] });
                assert.throws(function() {
                    shape.addPort({ id: 'a' });
                }, function(err) {
                    return err.toString().indexOf('duplicities ') !== -1;
                });

            });

            QUnit.test('duplicate id - add ports', function(assert) {

                var shape = create({ items: [{ id: 'a' }] });
                assert.throws(function() {
                    shape.addPorts([{ id: 'x' }, { id: 'x' }]);
                }, function(err) {
                    return err.toString().indexOf('duplicities') !== -1;
                });
            });

            QUnit.test('auto generated id', function(assert) {

                var shape = create({ items: [{ 'group': 'in' }] });

                assert.equal(shape.getPorts().length, 1);
                assert.ok(shape.getPorts()[0].id !== undefined, 'normalized on initialization');

                shape.addPort({ group: 'a' });
                assert.equal(shape.getPorts().length, 2);
                assert.ok(shape.getPorts()[1].id !== undefined);
            });
        });
    });

    QUnit.module('attributes and markup', function() {

        QUnit.test('is rendered correctly', function(assert) {

            var ports = [
                {
                    id: 'fst',
                    markup: '<g class="firstport"><rect/><text class="text"/></g>',
                    attrs: {
                        '.text': {
                            fill: 'blue',
                            text: 'aaa'
                        }
                    }
                },
                {
                    id: 'snd',
                    attrs: {
                        'circle': {
                            fill: 'red'
                        }
                    }
                }
            ];

            var shape = create({ items: ports });

            var shapeView = new joint.dia.ElementView({ model: shape });
            var renderPortSpy = sinon.spy(shapeView, '_createPortElement');

            shapeView.render();

            assert.ok(renderPortSpy.calledTwice);

            assert.equal(shapeView.$el.find('.joint-port').length, 2);

            var fst = shapeView.$el.find('.firstport');
            var rect = fst.find('rect');
            var text = fst.find('.text');
            assert.equal(fst.length, 1);
            assert.equal(rect.length, 1);
            assert.equal(text.length, 1);
            assert.equal(text.attr('fill'), 'blue');
            assert.equal(text[0].textContent, 'aaa');

            var snd = shapeView.$el.find('.joint-port').eq(1);
            var sndPortShape = snd.children().eq(0);
            assert.equal(snd.length, 1);
            assert.equal(sndPortShape[0].tagName.toLowerCase(), $(shape.portMarkup)[0].tagName.toLowerCase());
            assert.equal(sndPortShape.attr('fill'), 'red');
        });

        QUnit.test('render custom port markup', function(assert) {
            var WithoutPorts = joint.dia.Element.extend({
                markup: '<g class="rotatable"><g class="scalable"><rect class="rectangle"/></g><text/></g>',
                portMarkup: '<circle class="custom-port-markup"/>',
                defaults: _.defaultsDeep({ type: 'temp' }, joint.dia.Element.prototype.defaults)
            });

            var model = new WithoutPorts();
            var shapeView = new joint.dia.ElementView({ model: model });
            model.addPorts([{ id: 'a' }, { id: 'b', markup: '<rect class="custom-rect" />' }]);

            shapeView.render();

            assert.equal(shapeView.$el.find('.joint-port').length, 2, 'port wraps');

            assert.equal(shapeView.$el.find('.custom-port-markup').length, 1);
            assert.equal(shapeView.$el.find('.custom-port-markup')[0].tagName, 'circle');

            assert.equal(shapeView.$el.find('.custom-rect').length, 1);
            assert.equal(shapeView.$el.find('.custom-rect')[0].tagName, 'rect');
        });

        QUnit.test('port update/render count', function(assert) {
            [true, false].forEach(useCSSSelectors => {
                const model = new joint.shapes.standard.Rectangle({
                    size: { width: 100, height: 100 },
                    ports: {
                        items: [{ id: 'port1' }, { id: 'port2' }]
                    }
                });
                model.useCSSSelectors = useCSSSelectors;
                const shapeView = new joint.dia.ElementView({ model: model });
                const renderPortsSpy = sinon.spy(shapeView, '_renderPorts');
                const updatePortsSpy = sinon.spy(shapeView, '_updatePorts');
                const flags = joint.dia.ElementView.Flags;
                // 1 update exactly
                [
                    [flags.PORTS], // on ports change
                    [flags.UPDATE], // on attrs change
                    [flags.RESIZE, flags.PORTS, flags.TOOLS], // on resize
                ].forEach(f => {
                    renderPortsSpy.resetHistory();
                    updatePortsSpy.resetHistory();
                    shapeView.confirmUpdate(shapeView.getFlag(f), {});
                    let expectedCount = 1;
                    if (useCSSSelectors === false && joint.util.isEqual(f, [flags.UPDATE])) {
                        expectedCount = 0;
                    }
                    assert.equal(renderPortsSpy.callCount, expectedCount, `render called ${flags}`);
                    assert.equal(updatePortsSpy.callCount, expectedCount, `update called ${flags}`);
                });

                // No update
                [
                    [flags.TRANSLATE], // on position change
                    [flags.ROTATE], // on angle change
                ].forEach(flags => {
                    renderPortsSpy.resetHistory();
                    updatePortsSpy.resetHistory();
                    shapeView.confirmUpdate(shapeView.getFlag(flags), {});
                    assert.equal(renderPortsSpy.callCount, 0, `render called ${flags}`);
                    assert.equal(updatePortsSpy.callCount, 0, `update called ${flags}`);
                });
            });
        });

        QUnit.test('Selectors', function(assert) {

            var shape = create({
                items: [{
                    markup: [{
                        tagName: 'circle',
                        selector: 'c',
                        groupSelector: 'cr'
                    }, {
                        tagName: 'rect',
                        selector: 'r',
                        groupSelector: 'cr'
                    }],
                    attrs: {
                        root: { rootTest: true },
                        c: { circleTest: true },
                        r: { rectTest: true },
                        cr: { groupTest: true }
                    }
                }]
            });

            var shapeView = new joint.dia.ElementView({ model: shape });
            shapeView.render();

            var rootNode = shapeView.el.querySelector('[root-test]');
            var circleNode = shapeView.el.querySelector('[circle-test]');
            var rectNode = shapeView.el.querySelector('[rect-test]');
            var group = shapeView.el.querySelectorAll('[group-test]');
            assert.ok(rootNode instanceof SVGGElement);
            assert.ok(circleNode instanceof SVGCircleElement);
            assert.ok(rectNode instanceof SVGRectElement);
            assert.equal(group.length, 2);
            assert.equal(group[0], circleNode);
            assert.equal(group[1], rectNode);
        });
    });

    QUnit.module('port update', function() {

        QUnit.test('remove port elements from DOM', function(assert) {

            var element = create();

            element.addPorts([{ id: 'a' }, { id: 'b' }]);

            var view = new joint.dia.ElementView({ model: element });

            view.render();

            assert.equal(view.vel.find('.joint-port').length, 2);
            view._removePorts();
            assert.equal(view.vel.find('.joint-port').length, 0, 'ports elements removed');
        });
    });

    QUnit.module('z - index', function(hooks) {

        QUnit.module('evaluate from definition', function(hooks) {

            QUnit.test('test name', function(assert) {

                var shape = create({
                    groups: { 'a': { z: 0 }}
                });

                shape.addPorts([
                    { z: 0 },
                    { z: 'auto' },
                    { z: undefined },
                    { group: 'a' }
                ]);

                var ports = shape._portSettingsData.getPorts();

                assert.equal(ports[0].z, 0);
                assert.equal(ports[1].z, 'auto');
                assert.equal(ports[2].z, 'auto');
                assert.equal(ports[3].z, 0);
            });
        });

        QUnit.test('elements order with z-index', function(assert) {

            var data = {
                items: [
                    { z: 7, id: '7' },
                    { z: 6, id: '6' },
                    { z: 5, id: '5' },
                    { z: 4, id: '4' },
                    { id: 'x' },
                    { z: 3, id: '3' },
                    { z: 2, id: '2' },
                    { z: 1, id: '1' },
                    { z: 0, id: '0-1' },
                    { z: 0, id: '0-2' },
                    { z: 0, id: '0-3' }
                ]
            };

            var shape = create(data);
            var view = new joint.dia.ElementView({ model: shape }).render();

            var nodes = view.$el.find('.rotatable').children();

            // var result = [];
            // _.each(nodes, function(n) {
            //     result.push($(n).find('[port]').attr('port'));
            // });
            // console.log(result);

            var i = 0;
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '0-1', 'z index 0, 0nth node');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '0-2');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '0-3');
            assert.ok(nodes.eq(i++).hasClass('scalable'));
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '1');
            assert.equal(nodes.eq(i++)[0].tagName, 'text');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '2');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), 'x');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '3');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '4');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '5');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '6');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '7');
        });

        QUnit.test('elements order with z-index and without', function(assert) {

            var data = {
                items: [
                    { id: '111' },
                    { id: '1' },
                    { id: '2' },
                    { id: '0001' },
                    { z: 20, id: 'z20' },
                    { z: 30, id: 'z30' }
                ]
            };

            var shape = create(data);
            var view = new joint.dia.ElementView({ model: shape }).render();

            var nodes = view.$el.find('.rotatable').children();

            // var result = [];
            // _.each(nodes, function(n) {
            //     result.push($(n).find('[port]').attr('port'));
            // });
            // console.log(result);

            var i = 0;
            assert.ok(nodes.eq(i++).hasClass('scalable'));
            assert.equal(nodes.eq(i++)[0].tagName, 'text');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '111');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '1');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '2');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), '0001');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), 'z20');
            assert.equal(nodes.eq(i++).find('[port]').attr('port'), 'z30');
        });

        QUnit.test('elements order - no z-index defined', function(assert) {

            var data = {
                items: [
                    { id: 'a' },
                    { id: 'b' },
                    { id: 'c' }
                ]
            };

            var shape = create(data);
            var view = new joint.dia.ElementView({ model: shape }).render();

            var nodes = view.$el.find('.rotatable').children();

            assert.ok(nodes.eq(0).hasClass('scalable'));
            assert.equal(nodes.eq(1)[0].tagName, 'text');

            assert.equal(nodes.eq(2).find('[port]').attr('port'), 'a');
            assert.equal(nodes.eq(3).find('[port]').attr('port'), 'b');
            assert.equal(nodes.eq(4).find('[port]').attr('port'), 'c');
        });
    });

    QUnit.module('port labels', function() {

        QUnit.test('label attributes', function(assert) {

            // assert that:
            // - `group.attrs` (if any) overwrite `group.label.position.args.attrs`
            //   - `group.label.position.args.attrs` (if any) overwrite portLabel layout function defaults
            //     - portLabel layout function defaults (if any) overwrite portLabel defaults

            // TODO: check `angle` property overwriting too
            // - you can use `V.matrixToRotate(V.transformStringToMatrix('matrix(...)'))` to find angle from transform string

            // when adding entries to `data.groups`, don't forget to add corresponding entries to `data.items`, too
            const data = {
                groups: {
                    'manual': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'manual'
                                //args: { x: 0, y: 0, angle: 0, attrs: {}}
                            }
                        }
                    },
                    'manualAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'manual'
                                //args: { x: 0, y: 0, angle: 0 }
                            }
                        }
                    },
                    'manualLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'manual',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'manualBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'manual',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'left': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'left'
                                //args: { x: -15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                            }
                        }
                    },
                    'leftAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'left'
                                //args: { x: -15, y: 0, angle: 0 }
                            }
                        }
                    },
                    'leftLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'left',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'leftBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'left',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'right': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'right'
                                //args: { x: 15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'start' }}}
                            }
                        }
                    },
                    'rightAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'right'
                                //args: { x: 15, y: 0, angle: 0 }
                            }
                        }
                    },
                    'rightLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'right',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'rightBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'right',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'top': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'top'
                                //args: { x: 0, y: -15, angle: 0, attrs: { labelText: { y: '0', textAnchor: 'middle' }}}
                            }
                        }
                    },
                    'topAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'top'
                                //args: { x: 0, y: -15, angle: 0 }
                            }
                        }
                    },
                    'topLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'top',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'topBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'top',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'bottom': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'bottom'
                                //args: { x: 0, y: 15, angle: 0, attrs: { labelText: { y: '.6em', textAnchor: 'middle' }}}
                            }
                        }
                    },
                    'bottomAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'bottom'
                                //args: { x: 0, y: 15, angle: 0 }
                            }
                        }
                    },
                    'bottomLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'bottom',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'bottomBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'bottom',
                                args: { x: 10, y: 20, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'outside': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'outside'
                                //args: { x: 0, y: 15, angle: 0, attrs: { labelText: { y: '.6em', textAnchor: 'middle' }}}
                            }
                        }
                    },
                    'outsideAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'outside'
                                //args: { x: 0, y: 15, angle: 0 }
                            }
                        }
                    },
                    'outsideLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'outside',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'outsideBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'outside',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'outsideOriented': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'outsideOriented'
                                //args: { x: 0, y: 15, angle: 90, attrs: { labelText: { y: '.3em', textAnchor: 'start' }}}
                            }
                        }
                    },
                    'outsideOrientedAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'outsideOriented'
                                //args: { x: 0, y: 15, angle: 90 }
                            }
                        }
                    },
                    'outsideOrientedLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'outsideOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 90 }
                            }
                        }
                    },
                    'outsideOrientedBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'outsideOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 90 }
                            }
                        }
                    },
                    'inside': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'inside'
                                //args: { x: 0, y: -15, angle: 0, attrs: { labelText: { y: '0', textAnchor: 'middle' }}}
                            }
                        }
                    },
                    'insideAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'inside'
                                //args: { x: 0, y: -15, angle: 0 }
                            }
                        }
                    },
                    'insideLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'inside',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'insideBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'start' }
                        },
                        label: {
                            position: {
                                name: 'inside',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'insideOriented': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'insideOriented'
                                //args: { x: 0, y: -15, angle: -90, attrs: { labelText: { y: '.3em', textAnchor: 'start' }}}
                            }
                        }
                    },
                    'insideOrientedAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'insideOriented'
                                //args: { x: 0, y: -15, angle: -90 }
                            }
                        }
                    },
                    'insideOrientedLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'insideOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: -90 }
                            }
                        }
                    },
                    'insideOrientedBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'insideOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'end' }}}
                                //args: { angle: -90 }
                            }
                        }
                    },
                    'radial': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'radial'
                                //args: { x: -14, y: 14, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                            }
                        }
                    },
                    'radialAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'radial'
                                //args: { x: -14, y: 14, angle: 0 }
                            }
                        }
                    },
                    'radialLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'radial',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'radialBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'radial',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: 0 }
                            }
                        }
                    },
                    'radialOriented': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'radialOriented'
                                //args: { x: -14, y: 14, angle: -45, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                            }
                        }
                    },
                    'radialOrientedAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'radialOriented'
                                //args: { x: -14, y: 14, angle: -45 }
                            }
                        }
                    },
                    'radialOrientedLabelAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: {
                                name: 'radialOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: -45 }
                            }
                        }
                    },
                    'radialOrientedBothAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: {
                                name: 'radialOriented',
                                args: { offset: 11, attrs: { labelText: { x: '.1em', y: '.2em', textAnchor: 'start' }}}
                                //args: { angle: -45 }
                            }
                        }
                    },
                    'fn': {
                        position: {
                            name: 'left'
                            //args: { x: 0, y: 1 }
                        },
                        label: {
                            position: (_portPosition, _elBBox, _opt) => ({ x: 100, y: 100, angle: 0 })
                            //args: { x: -14, y: 14, angle: -45, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                        }
                    },
                    'fnAttrs': {
                        position: {
                            name: 'left',
                            //args: { x: 0, y: 1 }
                        },
                        attrs: {
                            labelText: { x: '.11em', y: '.12em', textAnchor: 'middle' }
                        },
                        label: {
                            position: (_portPosition, _elBBox, _opt) => ({ x: 100, y: 100, angle: 0 })
                            //args: { x: -14, y: 14, angle: -45 }
                        }
                    }
                },
                items: [
                    {
                        id: 'manual',
                        group: 'manual'
                    },
                    {
                        id: 'manualAttrs',
                        group: 'manualAttrs'
                    },
                    {
                        id: 'manualLabelAttrs',
                        group: 'manualLabelAttrs'
                    },
                    {
                        id: 'manualBothAttrs',
                        group: 'manualBothAttrs'
                    },
                    {
                        id: 'left',
                        group: 'left'
                    },
                    {
                        id: 'leftAttrs',
                        group: 'leftAttrs'
                    },
                    {
                        id: 'leftLabelAttrs',
                        group: 'leftLabelAttrs'
                    },
                    {
                        id: 'leftBothAttrs',
                        group: 'leftBothAttrs'
                    },
                    {
                        id: 'right',
                        group: 'right'
                    },
                    {
                        id: 'rightAttrs',
                        group: 'rightAttrs'
                    },
                    {
                        id: 'rightLabelAttrs',
                        group: 'rightLabelAttrs'
                    },
                    {
                        id: 'rightBothAttrs',
                        group: 'rightBothAttrs'
                    },
                    {
                        id: 'top',
                        group: 'top'
                    },
                    {
                        id: 'topAttrs',
                        group: 'topAttrs'
                    },
                    {
                        id: 'topLabelAttrs',
                        group: 'topLabelAttrs'
                    },
                    {
                        id: 'topBothAttrs',
                        group: 'topBothAttrs'
                    },
                    {
                        id: 'bottom',
                        group: 'bottom'
                    },
                    {
                        id: 'bottomAttrs',
                        group: 'bottomAttrs'
                    },
                    {
                        id: 'bottomLabelAttrs',
                        group: 'bottomLabelAttrs'
                    },
                    {
                        id: 'bottomBothAttrs',
                        group: 'bottomBothAttrs'
                    },
                    {
                        id: 'outside',
                        group: 'outside'
                    },
                    {
                        id: 'outsideAttrs',
                        group: 'outsideAttrs'
                    },
                    {
                        id: 'outsideLabelAttrs',
                        group: 'outsideLabelAttrs'
                    },
                    {
                        id: 'outsideBothAttrs',
                        group: 'outsideBothAttrs'
                    },
                    {
                        id: 'outsideOriented',
                        group: 'outsideOriented'
                    },
                    {
                        id: 'outsideOrientedAttrs',
                        group: 'outsideOrientedAttrs'
                    },
                    {
                        id: 'outsideOrientedLabelAttrs',
                        group: 'outsideOrientedLabelAttrs'
                    },
                    {
                        id: 'outsideOrientedBothAttrs',
                        group: 'outsideOrientedBothAttrs'
                    },
                    {
                        id: 'inside',
                        group: 'inside'
                    },
                    {
                        id: 'insideAttrs',
                        group: 'insideAttrs'
                    },
                    {
                        id: 'insideLabelAttrs',
                        group: 'insideLabelAttrs'
                    },
                    {
                        id: 'insideBothAttrs',
                        group: 'insideBothAttrs'
                    },
                    {
                        id: 'insideOriented',
                        group: 'insideOriented'
                    },
                    {
                        id: 'insideOrientedAttrs',
                        group: 'insideOrientedAttrs'
                    },
                    {
                        id: 'insideOrientedLabelAttrs',
                        group: 'insideOrientedLabelAttrs'
                    },
                    {
                        id: 'insideOrientedBothAttrs',
                        group: 'insideOrientedBothAttrs'
                    },
                    {
                        id: 'radial',
                        group: 'radial'
                    },
                    {
                        id: 'radialAttrs',
                        group: 'radialAttrs'
                    },
                    {
                        id: 'radialLabelAttrs',
                        group: 'radialLabelAttrs'
                    },
                    {
                        id: 'radialBothAttrs',
                        group: 'radialBothAttrs'
                    },
                    {
                        id: 'radialOriented',
                        group: 'radialOriented'
                    },
                    {
                        id: 'radialOrientedAttrs',
                        group: 'radialOrientedAttrs'
                    },
                    {
                        id: 'radialOrientedLabelAttrs',
                        group: 'radialOrientedLabelAttrs'
                    },
                    {
                        id: 'radialOrientedBothAttrs',
                        group: 'radialOrientedBothAttrs'
                    },
                    {
                        id: 'fn',
                        group: 'fn'
                    },
                    {
                        id: 'fnAttrs',
                        group: 'fnAttrs'
                    }
                ]
            };

            const shape = create(data);
            const view = new joint.dia.ElementView({ model: shape }).render();

            function getMatrix(node) {
                return node.getAttribute('transform');
            }

            // MANUAL:

            const manualG = view.findPortNode('manual').parentElement;
            assert.equal(getMatrix(manualG), 'matrix(1,0,0,1,0,1)');
            const manualText = manualG.querySelector('text');
            assert.equal(getMatrix(manualText), 'matrix(1,0,0,1,0,0)');
            assert.equal(manualText.getAttribute('x'), null);
            assert.equal(manualText.getAttribute('y'), null);
            assert.equal(manualText.getAttribute('text-anchor'), null);

            const manualAttrsG = view.findPortNode('manualAttrs').parentElement;
            assert.equal(getMatrix(manualAttrsG), 'matrix(1,0,0,1,0,1)');
            const manualAttrsText = manualAttrsG.querySelector('text');
            assert.equal(getMatrix(manualAttrsText), 'matrix(1,0,0,1,0,0)');
            // `attrs` come from `group.attrs`
            assert.equal(manualAttrsText.getAttribute('x'), '.11em');
            assert.equal(manualAttrsText.getAttribute('y'), '.12em');
            assert.equal(manualAttrsText.getAttribute('text-anchor'), 'middle');

            const manualLabelAttrsG = view.findPortNode('manualLabelAttrs').parentElement;
            assert.equal(getMatrix(manualLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const manualLabelAttrsText = manualLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(manualLabelAttrsText), 'matrix(1,0,0,1,10,20)');
            assert.equal(manualLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(manualLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(manualLabelAttrsText.getAttribute('text-anchor'), 'start');

            const manualBothAttrsG = view.findPortNode('manualBothAttrs').parentElement;
            assert.equal(getMatrix(manualBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const manualBothAttrsText = manualBothAttrsG.querySelector('text');
            assert.equal(getMatrix(manualBothAttrsText), 'matrix(1,0,0,1,10,20)');
            // `attrs` come from `group.attrs`
            assert.equal(manualBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(manualBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(manualBothAttrsText.getAttribute('text-anchor'), 'middle');

            // LEFT:

            const leftG = view.findPortNode('left').parentElement;
            assert.equal(getMatrix(leftG), 'matrix(1,0,0,1,0,1)');
            const leftText = leftG.querySelector('text');
            assert.equal(getMatrix(leftText), 'matrix(1,0,0,1,-15,0)');
            assert.equal(leftText.getAttribute('x'), null);
            assert.equal(leftText.getAttribute('y'), '.3em');
            assert.equal(leftText.getAttribute('text-anchor'), 'end');

            const leftAttrsG = view.findPortNode('leftAttrs').parentElement;
            assert.equal(getMatrix(leftAttrsG), 'matrix(1,0,0,1,0,1)');
            const leftAttrsText = leftAttrsG.querySelector('text');
            assert.equal(getMatrix(leftAttrsText), 'matrix(1,0,0,1,-15,0)');
            // `attrs` come from `group.attrs`
            assert.equal(leftAttrsText.getAttribute('x'), '.11em');
            assert.equal(leftAttrsText.getAttribute('y'), '.12em');
            assert.equal(leftAttrsText.getAttribute('text-anchor'), 'middle');

            const leftLabelAttrsG = view.findPortNode('leftLabelAttrs').parentElement;
            assert.equal(getMatrix(leftLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const leftLabelAttrsText = leftLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(leftLabelAttrsText), 'matrix(1,0,0,1,10,20)');
            assert.equal(leftLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(leftLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(leftLabelAttrsText.getAttribute('text-anchor'), 'start');

            const leftBothAttrsG = view.findPortNode('leftBothAttrs').parentElement;
            assert.equal(getMatrix(leftBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const leftBothAttrsText = leftBothAttrsG.querySelector('text');
            assert.equal(getMatrix(leftBothAttrsText), 'matrix(1,0,0,1,10,20)');
            // `attrs` come from `group.attrs`
            assert.equal(leftBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(leftBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(leftBothAttrsText.getAttribute('text-anchor'), 'middle');

            // RIGHT:

            const rightG = view.findPortNode('right').parentElement;
            assert.equal(getMatrix(rightG), 'matrix(1,0,0,1,0,1)');
            const rightText = rightG.querySelector('text');
            assert.equal(getMatrix(rightText), 'matrix(1,0,0,1,15,0)');
            assert.equal(rightText.getAttribute('x'), null);
            assert.equal(rightText.getAttribute('y'), '.3em');
            assert.equal(rightText.getAttribute('text-anchor'), 'start');

            const rightAttrsG = view.findPortNode('rightAttrs').parentElement;
            assert.equal(getMatrix(rightAttrsG), 'matrix(1,0,0,1,0,1)');
            const rightAttrsText = rightAttrsG.querySelector('text');
            assert.equal(getMatrix(rightAttrsText), 'matrix(1,0,0,1,15,0)');
            // `attrs` come from `group.attrs`
            assert.equal(rightAttrsText.getAttribute('x'), '.11em');
            assert.equal(rightAttrsText.getAttribute('y'), '.12em');
            assert.equal(rightAttrsText.getAttribute('text-anchor'), 'middle');

            const rightLabelAttrsG = view.findPortNode('rightLabelAttrs').parentElement;
            assert.equal(getMatrix(rightLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const rightLabelAttrsText = rightLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(rightLabelAttrsText), 'matrix(1,0,0,1,10,20)');
            assert.equal(rightLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(rightLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(rightLabelAttrsText.getAttribute('text-anchor'), 'end');

            const rightBothAttrsG = view.findPortNode('rightBothAttrs').parentElement;
            assert.equal(getMatrix(rightBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const rightBothAttrsText = rightBothAttrsG.querySelector('text');
            assert.equal(getMatrix(rightBothAttrsText), 'matrix(1,0,0,1,10,20)');
            // `attrs` come from `group.attrs`
            assert.equal(rightBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(rightBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(rightBothAttrsText.getAttribute('text-anchor'), 'middle');

            // TOP:

            const topG = view.findPortNode('top').parentElement;
            assert.equal(getMatrix(topG), 'matrix(1,0,0,1,0,1)');
            const topText = topG.querySelector('text');
            assert.equal(getMatrix(topText), 'matrix(1,0,0,1,0,-15)');
            assert.equal(topText.getAttribute('x'), null);
            assert.equal(topText.getAttribute('y'), '0');
            assert.equal(topText.getAttribute('text-anchor'), 'middle');

            const topAttrsG = view.findPortNode('topAttrs').parentElement;
            assert.equal(getMatrix(topAttrsG), 'matrix(1,0,0,1,0,1)');
            const topAttrsText = topAttrsG.querySelector('text');
            assert.equal(getMatrix(topAttrsText), 'matrix(1,0,0,1,0,-15)');
            // `attrs` come from `group.attrs`
            assert.equal(topAttrsText.getAttribute('x'), '.11em');
            assert.equal(topAttrsText.getAttribute('y'), '.12em');
            assert.equal(topAttrsText.getAttribute('text-anchor'), 'start');

            const topLabelAttrsG = view.findPortNode('bottomLabelAttrs').parentElement;
            assert.equal(getMatrix(topLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const topLabelAttrsText = topLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(topLabelAttrsText), 'matrix(1,0,0,1,10,20)');
            assert.equal(topLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(topLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(topLabelAttrsText.getAttribute('text-anchor'), 'end');

            const topBothAttrsG = view.findPortNode('bottomBothAttrs').parentElement;
            assert.equal(getMatrix(topBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const topBothAttrsText = topBothAttrsG.querySelector('text');
            assert.equal(getMatrix(topBothAttrsText), 'matrix(1,0,0,1,10,20)');
            // `attrs` come from `group.attrs`
            assert.equal(topBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(topBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(topBothAttrsText.getAttribute('text-anchor'), 'start');

            // BOTTOM:

            const bottomG = view.findPortNode('bottom').parentElement;
            assert.equal(getMatrix(bottomG), 'matrix(1,0,0,1,0,1)');
            const bottomText = bottomG.querySelector('text');
            assert.equal(getMatrix(bottomText), 'matrix(1,0,0,1,0,15)');
            assert.equal(bottomText.getAttribute('x'), null);
            assert.equal(bottomText.getAttribute('y'), '.6em');
            assert.equal(bottomText.getAttribute('text-anchor'), 'middle');

            const bottomAttrsG = view.findPortNode('bottomAttrs').parentElement;
            assert.equal(getMatrix(bottomAttrsG), 'matrix(1,0,0,1,0,1)');
            const bottomAttrsText = bottomAttrsG.querySelector('text');
            assert.equal(getMatrix(bottomAttrsText), 'matrix(1,0,0,1,0,15)');
            // `attrs` come from `group.attrs`
            assert.equal(bottomAttrsText.getAttribute('x'), '.11em');
            assert.equal(bottomAttrsText.getAttribute('y'), '.12em');
            assert.equal(bottomAttrsText.getAttribute('text-anchor'), 'start');

            const bottomLabelAttrsG = view.findPortNode('bottomLabelAttrs').parentElement;
            assert.equal(getMatrix(bottomLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const bottomLabelAttrsText = bottomLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(bottomLabelAttrsText), 'matrix(1,0,0,1,10,20)');
            assert.equal(bottomLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(bottomLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(bottomLabelAttrsText.getAttribute('text-anchor'), 'end');

            const bottomBothAttrsG = view.findPortNode('bottomBothAttrs').parentElement;
            assert.equal(getMatrix(bottomBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const bottomBothAttrsText = bottomBothAttrsG.querySelector('text');
            assert.equal(getMatrix(bottomBothAttrsText), 'matrix(1,0,0,1,10,20)');
            // `attrs` come from `group.attrs`
            assert.equal(bottomBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(bottomBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(bottomBothAttrsText.getAttribute('text-anchor'), 'start');

            // OUTSIDE:
            // = bottom

            const outsideG = view.findPortNode('outside').parentElement;
            assert.equal(getMatrix(outsideG), 'matrix(1,0,0,1,0,1)');
            const outsideText = outsideG.querySelector('text');
            assert.equal(getMatrix(outsideText), 'matrix(1,0,0,1,0,15)');
            assert.equal(outsideText.getAttribute('x'), null);
            assert.equal(outsideText.getAttribute('y'), '.6em');
            assert.equal(outsideText.getAttribute('text-anchor'), 'middle');

            const outsideAttrsG = view.findPortNode('outsideAttrs').parentElement;
            assert.equal(getMatrix(outsideAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideAttrsText = outsideAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideAttrsText), 'matrix(1,0,0,1,0,15)');
            // `attrs` come from `group.attrs`
            assert.equal(outsideAttrsText.getAttribute('x'), '.11em');
            assert.equal(outsideAttrsText.getAttribute('y'), '.12em');
            assert.equal(outsideAttrsText.getAttribute('text-anchor'), 'start');

            const outsideLabelAttrsG = view.findPortNode('outsideLabelAttrs').parentElement;
            assert.equal(getMatrix(outsideLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideLabelAttrsText = outsideLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideLabelAttrsText), 'matrix(1,0,0,1,0,11)');
            assert.equal(outsideLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(outsideLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(outsideLabelAttrsText.getAttribute('text-anchor'), 'end');

            const outsideBothAttrsG = view.findPortNode('outsideBothAttrs').parentElement;
            assert.equal(getMatrix(outsideBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideBothAttrsText = outsideBothAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideBothAttrsText), 'matrix(1,0,0,1,0,11)');
            // `attrs` come from `group.attrs`
            assert.equal(outsideBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(outsideBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(outsideBothAttrsText.getAttribute('text-anchor'), 'start');

            // OUTSIDE ORIENTED:
            // = like right, written top-down (angle: 90 clockwise)

            const outsideOrientedG = view.findPortNode('outsideOriented').parentElement;
            assert.equal(getMatrix(outsideOrientedG), 'matrix(1,0,0,1,0,1)');
            const outsideOrientedText = outsideOrientedG.querySelector('text');
            assert.equal(getMatrix(outsideOrientedText), 'matrix(6.123233995736766e-17,1,-1,6.123233995736766e-17,0,15)');
            assert.equal(outsideOrientedText.getAttribute('x'), null);
            assert.equal(outsideOrientedText.getAttribute('y'), '.3em');
            assert.equal(outsideOrientedText.getAttribute('text-anchor'), 'start');

            const outsideOrientedAttrsG = view.findPortNode('outsideOrientedAttrs').parentElement;
            assert.equal(getMatrix(outsideOrientedAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideOrientedAttrsText = outsideOrientedAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideOrientedAttrsText), 'matrix(6.123233995736766e-17,1,-1,6.123233995736766e-17,0,15)');
            // `attrs` come from `group.attrs`
            assert.equal(outsideOrientedAttrsText.getAttribute('x'), '.11em');
            assert.equal(outsideOrientedAttrsText.getAttribute('y'), '.12em');
            assert.equal(outsideOrientedAttrsText.getAttribute('text-anchor'), 'middle');

            const outsideOrientedLabelAttrsG = view.findPortNode('outsideOrientedLabelAttrs').parentElement;
            assert.equal(getMatrix(outsideOrientedLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideOrientedLabelAttrsText = outsideOrientedLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideOrientedLabelAttrsText), 'matrix(6.123233995736766e-17,1,-1,6.123233995736766e-17,0,11)');
            assert.equal(outsideOrientedLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(outsideOrientedLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(outsideOrientedLabelAttrsText.getAttribute('text-anchor'), 'end');

            const outsideOrientedBothAttrsG = view.findPortNode('outsideOrientedBothAttrs').parentElement;
            assert.equal(getMatrix(outsideOrientedBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const outsideOrientedBothAttrsText = outsideOrientedBothAttrsG.querySelector('text');
            assert.equal(getMatrix(outsideOrientedBothAttrsText), 'matrix(6.123233995736766e-17,1,-1,6.123233995736766e-17,0,11)');
            // `attrs` come from `group.attrs`
            assert.equal(outsideOrientedBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(outsideOrientedBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(outsideOrientedBothAttrsText.getAttribute('text-anchor'), 'middle');

            // INSIDE:
            // = top

            const insideG = view.findPortNode('inside').parentElement;
            assert.equal(getMatrix(insideG), 'matrix(1,0,0,1,0,1)');
            const insideText = insideG.querySelector('text');
            assert.equal(getMatrix(insideText), 'matrix(1,0,0,1,0,-15)');
            assert.equal(insideText.getAttribute('x'), null);
            assert.equal(insideText.getAttribute('y'), '0');
            assert.equal(insideText.getAttribute('text-anchor'), 'middle');

            const insideAttrsG = view.findPortNode('insideAttrs').parentElement;
            assert.equal(getMatrix(insideAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideAttrsText = insideAttrsG.querySelector('text');
            assert.equal(getMatrix(insideAttrsText), 'matrix(1,0,0,1,0,-15)');
            // `attrs` come from `group.attrs`
            assert.equal(insideAttrsText.getAttribute('x'), '.11em');
            assert.equal(insideAttrsText.getAttribute('y'), '.12em');
            assert.equal(insideAttrsText.getAttribute('text-anchor'), 'start');

            const insideLabelAttrsG = view.findPortNode('insideLabelAttrs').parentElement;
            assert.equal(getMatrix(insideLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideLabelAttrsText = insideLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(insideLabelAttrsText), 'matrix(1,0,0,1,0,-11)');
            assert.equal(insideLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(insideLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(insideLabelAttrsText.getAttribute('text-anchor'), 'end');

            const insideBothAttrsG = view.findPortNode('insideBothAttrs').parentElement;
            assert.equal(getMatrix(insideBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideBothAttrsText = insideBothAttrsG.querySelector('text');
            assert.equal(getMatrix(insideBothAttrsText), 'matrix(1,0,0,1,0,-11)');
            // `attrs` come from `group.attrs`
            assert.equal(insideBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(insideBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(insideBothAttrsText.getAttribute('text-anchor'), 'start');

            // INSIDE ORIENTED:
            // = like right, written bottom-up (angle: -90 clockwise)

            const insideOrientedG = view.findPortNode('insideOriented').parentElement;
            assert.equal(getMatrix(insideOrientedG), 'matrix(1,0,0,1,0,1)');
            const insideOrientedText = insideOrientedG.querySelector('text');
            assert.equal(getMatrix(insideOrientedText), 'matrix(6.123233995736766e-17,-1,1,6.123233995736766e-17,0,-15)');
            assert.equal(insideOrientedText.getAttribute('x'), null);
            assert.equal(insideOrientedText.getAttribute('y'), '.3em');
            assert.equal(insideOrientedText.getAttribute('text-anchor'), 'start');

            const insideOrientedAttrsG = view.findPortNode('insideOrientedAttrs').parentElement;
            assert.equal(getMatrix(insideOrientedAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideOrientedAttrsText = insideOrientedAttrsG.querySelector('text');
            assert.equal(getMatrix(insideOrientedAttrsText), 'matrix(6.123233995736766e-17,-1,1,6.123233995736766e-17,0,-15)');
            // `attrs` come from `group.attrs`
            assert.equal(insideOrientedAttrsText.getAttribute('x'), '.11em');
            assert.equal(insideOrientedAttrsText.getAttribute('y'), '.12em');
            assert.equal(insideOrientedAttrsText.getAttribute('text-anchor'), 'middle');

            const insideOrientedLabelAttrsG = view.findPortNode('insideOrientedLabelAttrs').parentElement;
            assert.equal(getMatrix(insideOrientedLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideOrientedLabelAttrsText = insideOrientedLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(insideOrientedLabelAttrsText), 'matrix(6.123233995736766e-17,-1,1,6.123233995736766e-17,0,-11)');
            assert.equal(insideOrientedLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(insideOrientedLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(insideOrientedLabelAttrsText.getAttribute('text-anchor'), 'end');

            const insideOrientedBothAttrsG = view.findPortNode('insideOrientedBothAttrs').parentElement;
            assert.equal(getMatrix(insideOrientedBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const insideOrientedBothAttrsText = insideOrientedBothAttrsG.querySelector('text');
            assert.equal(getMatrix(insideOrientedBothAttrsText), 'matrix(6.123233995736766e-17,-1,1,6.123233995736766e-17,0,-11)');
            // `attrs` come from `group.attrs`
            assert.equal(insideOrientedBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(insideOrientedBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(insideOrientedBothAttrsText.getAttribute('text-anchor'), 'middle');

            // RADIAL:
            // = like left, written left-right

            const radialG = view.findPortNode('radial').parentElement;
            assert.equal(getMatrix(radialG), 'matrix(1,0,0,1,0,1)');
            const radialText = radialG.querySelector('text');
            assert.equal(getMatrix(radialText), 'matrix(1,0,0,1,-14,14)');
            assert.equal(radialText.getAttribute('x'), null);
            assert.equal(radialText.getAttribute('y'), '.3em');
            assert.equal(radialText.getAttribute('text-anchor'), 'end');

            const radialAttrsG = view.findPortNode('radialAttrs').parentElement;
            assert.equal(getMatrix(radialAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialAttrsText = radialAttrsG.querySelector('text');
            assert.equal(getMatrix(radialAttrsText), 'matrix(1,0,0,1,-14,14)');
            // `attrs` come from `group.attrs`
            assert.equal(radialAttrsText.getAttribute('x'), '.11em');
            assert.equal(radialAttrsText.getAttribute('y'), '.12em');
            assert.equal(radialAttrsText.getAttribute('text-anchor'), 'middle');

            const radialLabelAttrsG = view.findPortNode('radialLabelAttrs').parentElement;
            assert.equal(getMatrix(radialLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialLabelAttrsText = radialLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(radialLabelAttrsText), 'matrix(1,0,0,1,-8,8)');
            assert.equal(radialLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(radialLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(radialLabelAttrsText.getAttribute('text-anchor'), 'start');

            const radialBothAttrsG = view.findPortNode('radialBothAttrs').parentElement;
            assert.equal(getMatrix(radialBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialBothAttrsText = radialBothAttrsG.querySelector('text');
            assert.equal(getMatrix(radialBothAttrsText), 'matrix(1,0,0,1,-8,8)');
            // `attrs` come from `group.attrs`
            assert.equal(radialBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(radialBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(radialBothAttrsText.getAttribute('text-anchor'), 'middle');

            // RADIAL ORIENTED:
            // = like left, written left-right (angle: -45 clockwise)

            const radialOrientedG = view.findPortNode('radialOriented').parentElement;
            assert.equal(getMatrix(radialOrientedG), 'matrix(1,0,0,1,0,1)');
            const radialOrientedText = radialOrientedG.querySelector('text');
            assert.equal(getMatrix(radialOrientedText), 'matrix(0.7071067811865476,-0.7071067811865475,0.7071067811865475,0.7071067811865476,-14,14)');
            assert.equal(radialOrientedText.getAttribute('x'), null);
            assert.equal(radialOrientedText.getAttribute('y'), '.3em');
            assert.equal(radialOrientedText.getAttribute('text-anchor'), 'end');

            const radialOrientedAttrsG = view.findPortNode('radialOrientedAttrs').parentElement;
            assert.equal(getMatrix(radialOrientedAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialOrientedAttrsText = radialOrientedAttrsG.querySelector('text');
            assert.equal(getMatrix(radialOrientedAttrsText), 'matrix(0.7071067811865476,-0.7071067811865475,0.7071067811865475,0.7071067811865476,-14,14)');
            // `attrs` come from `group.attrs`
            assert.equal(radialOrientedAttrsText.getAttribute('x'), '.11em');
            assert.equal(radialOrientedAttrsText.getAttribute('y'), '.12em');
            assert.equal(radialOrientedAttrsText.getAttribute('text-anchor'), 'middle');

            const radialOrientedLabelAttrsG = view.findPortNode('radialOrientedLabelAttrs').parentElement;
            assert.equal(getMatrix(radialOrientedLabelAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialOrientedLabelAttrsText = radialOrientedLabelAttrsG.querySelector('text');
            assert.equal(getMatrix(radialOrientedLabelAttrsText), 'matrix(0.7071067811865476,-0.7071067811865475,0.7071067811865475,0.7071067811865476,-8,8)');
            assert.equal(radialOrientedLabelAttrsText.getAttribute('x'), '.1em');
            assert.equal(radialOrientedLabelAttrsText.getAttribute('y'), '.2em');
            assert.equal(radialOrientedLabelAttrsText.getAttribute('text-anchor'), 'start');

            const radialOrientedBothAttrsG = view.findPortNode('radialOrientedBothAttrs').parentElement;
            assert.equal(getMatrix(radialOrientedBothAttrsG), 'matrix(1,0,0,1,0,1)');
            const radialOrientedBothAttrsText = radialOrientedBothAttrsG.querySelector('text');
            assert.equal(getMatrix(radialOrientedBothAttrsText), 'matrix(0.7071067811865476,-0.7071067811865475,0.7071067811865475,0.7071067811865476,-8,8)');
            // `attrs` come from `group.attrs`
            assert.equal(radialOrientedBothAttrsText.getAttribute('x'), '.11em');
            assert.equal(radialOrientedBothAttrsText.getAttribute('y'), '.12em');
            assert.equal(radialOrientedBothAttrsText.getAttribute('text-anchor'), 'middle');

            // CALLBACK FN:
            // = uses provided function

            const fnG = view.findPortNode('fn').parentElement;
            assert.equal(getMatrix(fnG), 'matrix(1,0,0,1,0,1)');
            const fnText = fnG.querySelector('text');
            assert.equal(getMatrix(fnText), 'matrix(1,0,0,1,100,100)');
            assert.equal(fnText.getAttribute('x'), null);
            assert.equal(fnText.getAttribute('y'), null);
            assert.equal(fnText.getAttribute('text-anchor'), null);

            const fnAttrsG = view.findPortNode('fnAttrs').parentElement;
            assert.equal(getMatrix(fnAttrsG), 'matrix(1,0,0,1,0,1)');
            const fnAttrsText = fnAttrsG.querySelector('text');
            assert.equal(getMatrix(fnAttrsText), 'matrix(1,0,0,1,100,100)');
            // `attrs` come from `group.attrs`
            assert.equal(fnAttrsText.getAttribute('x'), '.11em');
            assert.equal(fnAttrsText.getAttribute('y'), '.12em');
            assert.equal(fnAttrsText.getAttribute('text-anchor'), 'middle');
        });
    });

    QUnit.module('port grouping', function() {

        QUnit.test('resolve position args', function(assert) {

            var data = {
                groups: {
                    'a': {
                        position: {
                            name: 'right',
                            args: { x: 10, y: 11, angle: 12 }
                        },
                        label: {
                            position: {
                                name: 'left',
                                args: { x: 10, y: 20, angle: 30 }
                            }
                        }

                    }, 'b': {
                        position: 'top'
                    }
                },
                items: [
                    {
                        id: 'pa',
                        args: { y: 20 },
                        group: 'a'
                    },
                    {
                        id: 'pb',
                        args: { y: 20 },
                        group: 'b'
                    }
                ]
            };

            var shape = create(data);
            new joint.dia.ElementView({ model: shape }).render();

            var getGroup = function(id) {
                return shape._portSettingsData.groups[id];
            }
            var getPort = function(id) {
                return _.find(shape._portSettingsData.ports, function(p) {
                    return p.id === id;
                });
            };

            assert.equal(getGroup(getPort('pa').group).position.layoutCallback, joint.layout.Port.right);
            assert.equal(getPort('pa').position.args.y, 20);
            assert.equal(getPort('pa').position.args.x, 10);

            assert.equal(getGroup(getPort('pb').group).position.layoutCallback, joint.layout.Port.top);
            assert.equal(getPort('pb').position.args.y, 20);
        });

        QUnit.test('resolve port labels', function(assert) {

            var data = {
                groups: {
                    'a': {
                        label: {
                            position: {
                                name: 'right',
                                args: { ty: 20 }
                            }
                        }
                    }, 'b': {}
                },
                items: [
                    { id: 'pa1', group: 'a', label: { position: { name: 'top', args: { tx: 11 }}}},
                    { id: 'pa2', group: 'a' },
                    { id: 'pb1', group: 'b', label: { position: { args: { tx: 11 }}}},
                    { id: 'pb2', group: 'b' }
                ]
            };

            var shape = create(data);
            new joint.dia.ElementView({ model: shape }).render();

            var getPort = function(id) {
                return _.find(shape._portSettingsData.ports, function(p) {
                    return p.id === id;
                });
            };

            assert.equal(getPort('pa1').label.position.layoutCallback, joint.layout.PortLabel.top, 'override group settings');
            assert.equal(getPort('pa1').label.position.args.tx, 11);
            assert.equal(getPort('pa1').label.position.args.ty, 20);

            assert.equal(getPort('pa2').label.position.layoutCallback, joint.layout.PortLabel.right, 'gets settings from group');

            assert.equal(getPort('pb1').label.position.layoutCallback, joint.layout.PortLabel.left, 'default settings, extra args');
            assert.equal(getPort('pb1').label.position.args.tx, 11);

            assert.equal(getPort('pb2').label.position.layoutCallback, joint.layout.PortLabel.left, 'defaults - no settings on group, either on port label');
        });
    });

    QUnit.module('port layout', function(hooks) {

        QUnit.test('throws on invalid coordinate strings', function(assert) {

            const elBBox = g.rect(0, 0, 100, 100);

            assert.throws(
                () => {
                    joint.layout.Port.left([
                        { x: 'a', y: 10 }
                    ], elBBox);
                },
                'Cannot convert port coordinate x: "a" to a number'
            );

            assert.throws(
                () => {
                    joint.layout.Port.left([
                        { x: 10, y: 'a' }
                    ], elBBox);
                },
                'Cannot convert port coordinate y: "a" to a number'
            );
        });

        QUnit.test('parses numeric string coordinates', function(assert) {
            const elBBox = g.rect(0, 0, 100, 100);
            const ports = [
                { x: '10', y: '20' },
                { x: '100', y: '100' },
            ];
            const trans = joint.layout.Port.left(ports, elBBox, {});
            assert.equal(trans[0].x, 10);
            assert.equal(trans[0].y, 20);
            assert.equal(trans[1].x, 100);
            assert.equal(trans[1].y, 100);
        });

        QUnit.test('straight line layouts', function(assert) {
            var ports = [
                {},
                {},
                { dx: 20, dy: -15 },
                { y: 100, x: 100, angle: 45 },
                { x: 'calc(w+11)', y: 'calc(h+13)' }
            ];
            var elBBox = g.rect(0, 0, 100, 100);
            var trans = joint.layout.Port.left(ports, elBBox, {});
            var delta = trans[1].y - trans[0].y;

            assert.equal(trans[0].y + delta, trans[1].y);
            assert.equal(trans[0].x, 0);
            assert.equal(trans[0].angle, 0);

            assert.equal(trans[2].y, trans[1].y + delta - 15, 'offset y should be applied');
            assert.equal(trans[2].x, 20);
            assert.equal(trans[2].angle, 0);

            assert.equal(trans[3].x, 100, 'override x position');
            assert.equal(trans[3].y, 100, 'override y position');
            assert.equal(trans[3].angle, 45);

            assert.equal(trans[4].x, 111, 'override x position');
            assert.equal(trans[4].y, 113, 'override y position');
        });

        QUnit.test('circular layouts', function(assert) {
            var ports = [
                {},
                { dr: 3, compensateRotation: true },
                { dx: 1, dy: 2, dr: 3 },
                { x: 'calc(w)', y: 101, angle: 10 }
            ];
            var elBBox = g.rect(0, 0, 100, 100);
            var trans = joint.layout.Port.ellipseSpread(ports, elBBox, {});

            assert.equal(Math.round(trans[1].angle), -270, 'rotation compensation applied');
            assert.equal(trans[1].x, 100 + 3, 'dr is applied');
            assert.equal(trans[1].y, 50);

            // middle bottom
            assert.equal(trans[2].x, 50 + 1, 'dx is applied');
            assert.equal(trans[2].y, 100 + 2 + 3, 'dy, dr are applied');

            assert.equal(trans[3].x, 100, 'x position overridden');
            assert.equal(trans[3].y, 101, 'y position overridden');
            assert.equal(trans[3].angle, 10, 'y position overridden');
        });

        QUnit.test('absolute layout', function(assert) {
            var ports = [
                {},
                { x: 20, y: -15, angle: 45 },
                { y: 'calc(w+11)', x: 'calc(h+13)' }
            ];
            var elBBox = new g.Rect(0, 0, 100, 100);
            var trans = joint.layout.Port.absolute(ports, elBBox, {});

            assert.equal(trans[0].y, 0);
            assert.equal(trans[0].x, 0);
            assert.equal(trans[0].angle, 0);

            assert.equal(trans[1].x, 20);
            assert.equal(trans[1].y, -15);
            assert.equal(trans[1].angle, 45);

            assert.equal(trans[2].y, 111);
            assert.equal(trans[2].x, 113);
            assert.equal(trans[2].angle, 0);
        });

        QUnit.test('callback fn port layout', function(assert) {
            const ports = [
                {},
                { x: 20, y: -15, angle: 45 },
                { y: 'calc(w+11)', x: 'calc(h+13)' }
            ];
            const elBBox = new g.Rect(0, 0, 100, 100);
            const trans = joint.layout.Port.fn(ports, elBBox, { fn: (ports, _elBBox, _opt) => (ports.map(() => ({ x: 100, y: 100, angle: 0 }))) });

            assert.equal(trans[0].x, 100);
            assert.equal(trans[0].y, 100);
            assert.equal(trans[0].angle, 0);

            assert.equal(trans[1].x, 100);
            assert.equal(trans[1].y, 100);
            assert.equal(trans[1].angle, 0);

            assert.equal(trans[2].y, 100);
            assert.equal(trans[2].x, 100);
            assert.equal(trans[2].angle, 0);
        });
    });

    QUnit.module('port layout namespace', function(hooks) {

        QUnit.test('add a layout definition', function(assert) {
            const portLayoutNamespace = {
                ...joint.layout.Port,
                hundred: (ports, _elBBox, _opt) => (ports.map(() => ({ x: 100, y: 100, angle: 0 })))
            };
            const shape = new joint.shapes.standard.Rectangle({
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                ports: {
                    groups: {
                        'hundred': {
                            position: {
                                name: 'hundred'
                            },
                            label: {
                                position: {
                                    name: 'left'
                                    //args: { x: -15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                        'absolute': {
                            position: {
                                name: 'absolute',
                                args: { x: 50, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'left'
                                    //args: { x: -15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                    },
                    items: [{
                        id: 'hundred',
                        group: 'hundred'
                    }, {
                        id: 'absolute',
                        group: 'absolute'
                    }]
                }
            }, {
                portLayoutNamespace
            });

            const view = new joint.dia.ElementView({ model: shape }).render();

            function getMatrix(node) {
                return node.getAttribute('transform');
            }

            // ADDED LAYOUT DEFINITION:

            const hundredG = view.findPortNode('hundred').parentElement;
            assert.equal(getMatrix(hundredG), 'matrix(1,0,0,1,100,100)');
            const hundredText = hundredG.querySelector('text');
            assert.equal(getMatrix(hundredText), 'matrix(1,0,0,1,-15,0)');
            assert.equal(hundredText.getAttribute('x'), null);
            assert.equal(hundredText.getAttribute('y'), '.3em');
            assert.equal(hundredText.getAttribute('text-anchor'), 'end');

            // BUILT-IN LAYOUT DEFINITION:

            const absoluteG = view.findPortNode('absolute').parentElement;
            assert.equal(getMatrix(absoluteG), 'matrix(1,0,0,1,50,50)');
            const absoluteText = absoluteG.querySelector('text');
            assert.equal(getMatrix(absoluteText), 'matrix(1,0,0,1,-15,0)');
            assert.equal(absoluteText.getAttribute('x'), null);
            assert.equal(absoluteText.getAttribute('y'), '.3em');
            assert.equal(absoluteText.getAttribute('text-anchor'), 'end');
        });

        QUnit.test('clone an element with added layout definition', function(assert) {
            const portLayoutNamespace = {
                ...joint.layout.Port,
                hundred: (ports, _elBBox, _opt) => (ports.map(() => ({ x: 100, y: 100, angle: 0 })))
            };
            const shape = new joint.shapes.standard.Rectangle({
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                ports: {
                    groups: {
                        'hundred': {
                            position: {
                                name: 'hundred'
                            },
                            label: {
                                position: {
                                    name: 'left'
                                    //args: { x: -15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                        'absolute': {
                            position: {
                                name: 'absolute',
                                args: { x: 50, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'left'
                                    //args: { x: -15, y: 0, angle: 0, attrs: { labelText: { y: '.3em', textAnchor: 'end' }}}
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                    },
                    items: [{
                        id: 'hundred',
                        group: 'hundred'
                    }, {
                        id: 'absolute',
                        group: 'absolute'
                    }]
                }
            }, {
                portLayoutNamespace
            });
            const shapeClone = shape.clone();

            const view = new joint.dia.ElementView({ model: shapeClone }).render();

            function getMatrix(node) {
                return node.getAttribute('transform');
            }

            // ADDED LAYOUT DEFINITION:

            const hundredG = view.findPortNode('hundred').parentElement;
            assert.equal(getMatrix(hundredG), 'matrix(1,0,0,1,100,100)');
            const hundredText = hundredG.querySelector('text');
            assert.equal(getMatrix(hundredText), 'matrix(1,0,0,1,-15,0)');
            assert.equal(hundredText.getAttribute('x'), null);
            assert.equal(hundredText.getAttribute('y'), '.3em');
            assert.equal(hundredText.getAttribute('text-anchor'), 'end');

            // BUILT-IN LAYOUT DEFINITION:

            const absoluteG = view.findPortNode('absolute').parentElement;
            assert.equal(getMatrix(absoluteG), 'matrix(1,0,0,1,50,50)');
            const absoluteText = absoluteG.querySelector('text');
            assert.equal(getMatrix(absoluteText), 'matrix(1,0,0,1,-15,0)');
            assert.equal(absoluteText.getAttribute('x'), null);
            assert.equal(absoluteText.getAttribute('y'), '.3em');
            assert.equal(absoluteText.getAttribute('text-anchor'), 'end');
        });
    });

    QUnit.module('port label layout namespace', function(hooks) {

        QUnit.test('add a label layout definition', function(assert) {
            const portLabelLayoutNamespace = {
                ...joint.layout.PortLabel,
                labelHundred: (_portPosition, _elBBox, _opt) => ({ x: 100, y: 100, angle: 0 })
            };
            const shape = new joint.shapes.standard.Rectangle({
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                ports: {
                    groups: {
                        'labelHundred': {
                            position: {
                                name: 'left'
                                //args: { x: 0, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'labelHundred'
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                        'manual': {
                            position: {
                                name: 'left'
                                //args: { x: 0, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'manual',
                                    args: { x: 50, y: 50 }
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                    },
                    items: [{
                        id: 'labelHundred',
                        group: 'labelHundred'
                    }, {
                        id: 'manual',
                        group: 'manual'
                    }]
                }
            }, {
                portLabelLayoutNamespace
            });

            const view = new joint.dia.ElementView({ model: shape }).render();

            function getMatrix(node) {
                return node.getAttribute('transform');
            }

            // ADDED LABEL LAYOUT DEFINITION:

            const labelHundredG = view.findPortNode('labelHundred').parentElement;
            assert.equal(getMatrix(labelHundredG), 'matrix(1,0,0,1,0,50)');
            const labelHundredText = labelHundredG.querySelector('text');
            assert.equal(getMatrix(labelHundredText), 'matrix(1,0,0,1,100,100)');
            assert.equal(labelHundredText.getAttribute('x'), null);
            assert.equal(labelHundredText.getAttribute('y'), '0.8em'); // default from Vectorizer
            assert.equal(labelHundredText.getAttribute('text-anchor'), null);

            // BUILT-IN LABEL LAYOUT DEFINITION:

            const manualG = view.findPortNode('manual').parentElement;
            assert.equal(getMatrix(manualG), 'matrix(1,0,0,1,0,50)');
            const manualText = manualG.querySelector('text');
            assert.equal(getMatrix(manualText), 'matrix(1,0,0,1,50,50)');
            assert.equal(manualText.getAttribute('x'), null);
            assert.equal(manualText.getAttribute('y'), '0.8em'); // default from Vectorizer
            assert.equal(manualText.getAttribute('text-anchor'), null);
        });

        QUnit.test('clone an element with added label layout definition', function(assert) {
            const portLabelLayoutNamespace = {
                ...joint.layout.PortLabel,
                labelHundred: (_portPosition, _elBBox, _opt) => ({ x: 100, y: 100, angle: 0 })
            };
            const shape = new joint.shapes.standard.Rectangle({
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                ports: {
                    groups: {
                        'labelHundred': {
                            position: {
                                name: 'left'
                                //args: { x: 0, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'labelHundred'
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                        'manual': {
                            position: {
                                name: 'left'
                                //args: { x: 0, y: 50 }
                            },
                            label: {
                                position: {
                                    name: 'manual',
                                    args: { x: 50, y: 50 }
                                },
                                markup: [{
                                    tagName: 'text',
                                    selector: 'label'
                                }]
                            },
                            attrs: {
                                portBody: {
                                    magnet: true,
                                    width: 16,
                                    height: 16,
                                    x: -8,
                                    y: -8,
                                    fill: '#03071E'
                                },
                                label: {
                                    text: 'port'
                                }
                            },
                            markup: [{
                                tagName: 'rect',
                                selector: 'portBody'
                            }]
                        },
                    },
                    items: [{
                        id: 'labelHundred',
                        group: 'labelHundred'
                    }, {
                        id: 'manual',
                        group: 'manual'
                    }]
                }
            }, {
                portLabelLayoutNamespace
            });
            const shapeClone = shape.clone();

            const view = new joint.dia.ElementView({ model: shapeClone }).render();

            function getMatrix(node) {
                return node.getAttribute('transform');
            }

            // ADDED LABEL LAYOUT DEFINITION:

            const labelHundredG = view.findPortNode('labelHundred').parentElement;
            assert.equal(getMatrix(labelHundredG), 'matrix(1,0,0,1,0,50)');
            const labelHundredText = labelHundredG.querySelector('text');
            assert.equal(getMatrix(labelHundredText), 'matrix(1,0,0,1,100,100)');
            assert.equal(labelHundredText.getAttribute('x'), null);
            assert.equal(labelHundredText.getAttribute('y'), '0.8em'); // default from Vectorizer
            assert.equal(labelHundredText.getAttribute('text-anchor'), null);

            // BUILT-IN LABEL LAYOUT DEFINITION:

            const manualG = view.findPortNode('manual').parentElement;
            assert.equal(getMatrix(manualG), 'matrix(1,0,0,1,0,50)');
            const manualText = manualG.querySelector('text');
            assert.equal(getMatrix(manualText), 'matrix(1,0,0,1,50,50)');
            assert.equal(manualText.getAttribute('x'), null);
            assert.equal(manualText.getAttribute('y'), '0.8em'); // default from Vectorizer
            assert.equal(manualText.getAttribute('text-anchor'), null);
        });
    });

    QUnit.module('getPortsPositions', function() {

        QUnit.test('ports positions can be retrieved even if element is not rendered yet', function(assert) {

            var shape = create({
                groups: {
                    'a': { position: 'left' }
                },
                items: [
                    { id: 'one', group: 'a' },
                    { id: 'two', group: 'a' },
                    { id: 'three', group: 'a' }
                ]
            }).set('size', { width: 5, height: 10 });

            var portsPositions = shape.getPortsPositions('a');

            assert.ok(portsPositions.one.y > 0);
            assert.ok(portsPositions.one.y < portsPositions.two.y);
            assert.ok(portsPositions.two.y < portsPositions.three.y);
        });
    });

    QUnit.module('getPortCenter', function() {

        QUnit.test('ports center can be retrieved', function(assert) {

            const layoutSpy = sinon.spy(joint.layout.Port, 'left');

            const shape = create({
                groups: {
                    'a': { position: 'left' }
                },
                items: [
                    { id: 'one', group: 'a' },
                    { id: 'two', group: 'a' },
                    { id: 'three', group: 'a' }
                ]
            }).set('size', { width: 5, height: 10 });

            let portPositionOne, portPositionTwo, portPositionThree;

            portPositionOne = shape.getPortCenter('one');
            portPositionTwo = shape.getPortCenter('two');
            portPositionThree = shape.getPortCenter('three');

            assert.ok(portPositionOne.y > 0);
            assert.ok(portPositionOne.y < portPositionTwo.y);
            assert.ok(portPositionTwo.y < portPositionThree.y);

            assert.ok(layoutSpy.calledOnce, 'layout function called once');

            shape.resize(13, 17);

            portPositionOne = shape.getPortCenter('one');
            portPositionTwo = shape.getPortCenter('two');
            portPositionThree = shape.getPortCenter('three');

            assert.ok(portPositionOne.y > 0);
            assert.ok(portPositionOne.y < portPositionTwo.y);
            assert.ok(portPositionTwo.y < portPositionThree.y);

            assert.ok(layoutSpy.calledTwice, 'layout function called twice');

            layoutSpy.restore();
        });
    });

    QUnit.module('getPortBBox', function() {

        QUnit.test('port bounding box can be retrieved', function(assert) {

            const width = 17;
            const height = 13;

            const layoutSpy = sinon.spy(joint.layout.Port, 'left');

            const shape = create({
                groups: {
                    'a': {
                        position: 'left',
                        size: { width, height }
                    }
                },
                items: [
                    { id: 'one', group: 'a' },
                    { id: 'two', group: 'a' },
                    { id: 'three', group: 'a' }
                ]
            }).set('size', { width: 50, height: 50 });

            let portBBoxOne, portBBoxTwo, portBBoxThree;

            portBBoxOne = shape.getPortBBox('one');
            portBBoxTwo = shape.getPortBBox('two');
            portBBoxThree = shape.getPortBBox('three');

            assert.ok(portBBoxOne.y > 0);
            assert.ok(portBBoxOne.y < portBBoxTwo.y);
            assert.ok(portBBoxTwo.y < portBBoxThree.y);
            assert.equal(portBBoxOne.width, width);
            assert.equal(portBBoxOne.height, height);

            assert.ok(layoutSpy.calledOnce, 'layout function called once');

            shape.resize(100, 100);

            portBBoxOne = shape.getPortBBox('one');
            portBBoxTwo = shape.getPortBBox('two');
            portBBoxThree = shape.getPortBBox('three');

            assert.ok(portBBoxOne.y > 0);
            assert.ok(portBBoxOne.y < portBBoxTwo.y);
            assert.ok(portBBoxTwo.y < portBBoxThree.y);

            assert.ok(layoutSpy.calledTwice, 'layout function called once');

            layoutSpy.restore();
        });

        QUnit.test('option: rotate', function(assert) {

            const width = 17;
            const height = 13;

            const elX = 47;
            const elY = 53;
            const elWidth = 100;
            const elHeight = 100;

            const layoutSpy = sinon.spy(joint.layout.Port, 'left');

            const shape = create({
                groups: {
                    'a': {
                        position: 'left',
                        size: { width, height }
                    }
                },
                items: [
                    { id: 'one', group: 'a' },
                ]
            });

            shape.set({
                position: { x: elX, y: elY },
                size: { width: elWidth, height: elHeight },
                angle: 90,
            })

            const portUnrotatedBBox = shape.getPortBBox('one');
            const portRotatedBBox = shape.getPortBBox('one', { rotate: true });

            assert.ok(portUnrotatedBBox instanceof g.Rect);
            assert.ok(portRotatedBBox instanceof g.Rect);

            assert.equal(portUnrotatedBBox.x, elX + elWidth / 2 - width / 2);
            assert.equal(portUnrotatedBBox.y, elY - height / 2);
            assert.equal(Math.round(portUnrotatedBBox.width), width);
            assert.equal(Math.round(portUnrotatedBBox.height), height);

            assert.equal(portRotatedBBox.x, elX + elWidth / 2 - height / 2);
            assert.equal(portRotatedBBox.y, elY - width / 2);
            assert.equal(Math.round(portRotatedBBox.width), height);
            assert.equal(Math.round(portRotatedBBox.height), width);

            assert.ok(layoutSpy.calledOnce, 'layout function called once');

            layoutSpy.restore();
        });
    });

    QUnit.module('getGroupPorts', function() {

        QUnit.test('return ports with given group', function(assert) {

            var shape = create({
                groups: {
                    a: { position: 'left' },
                    b: { position: 'right' }
                },
                items: [
                    { id: 'one', group: 'a' },
                    { id: 'two', group: 'b' },
                    { id: 'three', group: 'b' },
                    { id: 'four', group: 'b' }
                ]
            });

            var portsA = shape.getGroupPorts('a');
            var portsB = shape.getGroupPorts('b');

            assert.equal(portsA.length, 1);
            assert.equal(portsB.length, 3);
            assert.ok(portsA.every(function(port) { return port.group === 'a'; }));
            assert.ok(portsB.every(function(port) { return port.group === 'b'; }));
        });
    });

    QUnit.module('getPortGroupNames', function() {

        QUnit.test('return group names of all ports', function(assert) {

                const shape = new joint.shapes.standard.Rectangle();

                assert.deepEqual(shape.getPortGroupNames(), [], 'no groups');

                shape.set({
                    ports: {
                        groups: {
                            a: { position: 'left' },
                            b: { position: 'right' }
                        },
                        items: [
                            { id: 'one', group: 'a' },
                            { id: 'two', group: 'b' },
                            { id: 'three', group: 'b' },
                            { id: 'four', group: 'b' }
                        ]
                    }
                });

                assert.deepEqual(shape.getPortGroupNames(), ['a', 'b'], 'group with ports');

                shape.prop('ports/groups/c', { position: 'top' });

                assert.deepEqual(shape.getPortGroupNames(), ['a', 'b', 'c'], 'group without ports');
            });
    });

    QUnit.module('portProp', function() {

        QUnit.test('set port properties', function(assert) {

            var shape = create({
                items: [
                    { id: 'one', attrs: { '.body': { fill: 'red' }}}
                ]
            });

            shape.portProp('one', 'attrs/.body/fill-opacity', 1);
            assert.equal(shape.prop('ports/items/0/attrs/.body/fill-opacity'), 1);

            shape.portProp('one', 'attrs/.body', { fill: 'newcolor' });
            assert.equal(shape.prop('ports/items/0/attrs/.body/fill'), 'newcolor');

            shape.portProp('one', 'attrs/.body', {});
            assert.equal(shape.prop('ports/items/0/attrs/.body/fill'), 'newcolor');

            shape.portProp('one', { attrs: { '.body': { fill: 'black', x: 1 }}});
            assert.equal(shape.prop('ports/items/0/attrs/.body/fill'), 'black');
            assert.equal(shape.prop('ports/items/0/attrs/.body/x'), 1);
        });

        QUnit.test('get port properties', function(assert) {

            var shape = create({
                items: [
                    { id: 'one', attrs: { '.body': { fill: 'red' }}}
                ]
            });

            var prop = shape.portProp('one', 'attrs/.body');
            assert.equal(prop.fill, 'red');

            prop = shape.portProp('one');
            assert.ok(prop.id, 'red');
        });

        QUnit.test('set port props, path defined as an array', function(assert) {

            var shape = create({
                items: [
                    { id: 'one' }
                ]
            });

            shape.portProp('one', ['array', 20], 'array item');
            shape.portProp('one', ['object', '20'], 'object property');

            assert.ok(_.isArray(shape.portProp('one', 'array')));
            assert.equal(shape.portProp('one', 'array')[20], 'array item');

            assert.ok(_.isPlainObject(shape.portProp('one', 'object')));
            assert.equal(shape.portProp('one', 'object/20'), 'object property');
        });
    });

    QUnit.module('event ports:add and ports:remove', function(hooks) {

        QUnit.config.testTimeout = 5000;

        QUnit.test('simple add', function(assert) {

            var shape = create({ items: [{}] });

            assert.expect(3);
            assert.equal(shape.getPorts().length, 1);

            var done = assert.async();

            shape.on('ports:add', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'a');
                done();
            });

            shape.addPort({ id: 'a' });
        });

        QUnit.test('rewrite', function(assert) {

            var shape = create({ items: [{ id: 'a' }] });

            assert.expect(5);
            assert.equal(shape.getPorts().length, 1);

            var eventAddDone = assert.async();
            var eventRemoveDone = assert.async();

            shape.on('ports:add', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'b');
                eventAddDone();
            });

            shape.on('ports:remove', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'a');
                eventRemoveDone();
            });

            shape.prop('ports/items', [{ id: 'b' }], { rewrite: true });
        });

        QUnit.test('change id', function(assert) {

            var shape = create({ items: [{ id: 'a' }] });

            assert.expect(5);
            assert.equal(shape.getPorts().length, 1);

            var eventAddDone = assert.async();
            var eventRemoveDone = assert.async();

            shape.on('ports:add', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'b');
                eventAddDone();
            });

            shape.on('ports:remove', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'a');
                eventRemoveDone();
            });

            shape.prop('ports/items/0/id', 'b');
        });

        QUnit.test('failed to add', function(assert) {

            var shape = create({ items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

            assert.expect(3);
            assert.equal(shape.getPorts().length, 3);

            var done = assert.async();

            shape.on('ports:remove', function(cell, ports) {
                assert.equal(ports.length, 1);
                assert.equal(ports[0].id, 'a');
                done();
            });

            shape.removePort('a');
        });

        QUnit.test('add multiple', function(assert) {

            var shape = create({ items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

            assert.expect(4);
            assert.equal(shape.getPorts().length, 3);

            var done = assert.async();

            shape.on('ports:add', function(cell, ports) {
                assert.equal(ports.length, 2);
                assert.equal(ports[0].id, 'x');
                assert.equal(ports[1].id, 'y');
                done();
            });

            shape.addPorts([{ id: 'x' }, { id: 'y' }]);
        });
    });

    QUnit.module('rendering', function(hooks) {

        let graph, paper;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            var fixtures = document.getElementById('qunit-fixture');
            var paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        QUnit.test('referencing port label node', function(assert) {
            const model = new joint.shapes.standard.Rectangle({
                size: { width: 200, height: 200 },
                portLabelMarkup: [
                    {
                        tagName: 'rect',
                        selector: 'rectCopy'
                    },
                    {
                        tagName: 'rect',
                        selector: 'rectRef'
                    }
                ],
                ports: {
                    groups: {
                        left: {
                            position: 'left',
                            label: {
                                position: {
                                    name: 'manual',
                                    args: {
                                        attrs: {
                                            'rectRef': {
                                                x: -11,
                                                y: -13
                                            }
                                        }
                                    }
                                }
                            },
                            attrs: {
                                rectCopy: {
                                    ref: 'rectRef',
                                    fill: 'red',
                                    x: 'calc(x)',
                                    y: 'calc(y)',
                                    width: 'calc(w)',
                                    height: 'calc(h)'
                                },
                                rectRef: {
                                    width: 100,
                                    height: 20,
                                },
                            }
                        },
                    },
                    items: [{
                        id: 'p1',
                        group: 'left'
                    }]
                }
            });
            model.addTo(graph, { async: false });
            const shapeView = model.findView(paper);
            const rectRefNode = shapeView.findPortNode('p1', 'rectRef');
            const rectCopyNode = shapeView.findPortNode('p1', 'rectCopy');
            const x = Number(rectRefNode.getAttribute('x'));
            const y = Number(rectRefNode.getAttribute('y'));
            const width = Number(rectRefNode.getAttribute('width'));
            const height = Number(rectRefNode.getAttribute('height'));
            // Reference rectangle should have a position and size set.
            assert.notEqual(x, 0);
            assert.notEqual(y, 0);
            assert.notEqual(width, 0);
            assert.notEqual(height, 0);
            // Rectangle copy should have the same position and size
            // as the reference rectangle.
            assert.equal(Number(rectCopyNode.getAttribute('x')), x);
            assert.equal(Number(rectCopyNode.getAttribute('y')), y);
            assert.equal(Number(rectCopyNode.getAttribute('width')), width);
            assert.equal(Number(rectCopyNode.getAttribute('height')), height);
        });
    });

});
