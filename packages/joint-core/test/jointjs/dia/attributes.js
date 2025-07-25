QUnit.module('Attributes', function() {

    QUnit.module('getAttributeDefinition()', function() {

        QUnit.test('will find correct definition', function(assert) {

            joint.dia.attributes.globalTest = 'global';
            joint.dia.attributes.priority = 'lower';

            var Cell = joint.dia.Cell.extend({}, {
                attributes: {
                    localTest: 'local',
                    priority: 'higher'
                }
            });

            assert.equal(Cell.getAttributeDefinition(), null);
            assert.equal(Cell.getAttributeDefinition('nonExistingTest'), null);
            assert.equal(Cell.getAttributeDefinition('globalTest'), 'global');
            assert.equal(Cell.getAttributeDefinition('localTest'), 'local');
            assert.equal(Cell.getAttributeDefinition('priority'), 'higher');
        });
    });

    QUnit.module('Text Attributes', function(hooks) {

        var WIDTH = 85;
        var HEIGHT = 97;

        var paper, graph, cell, cellView, node, refBBox;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            var fixtures = document.getElementById('qunit-fixture');
            var paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle();
            cell.addTo(graph);
            cellView = cell.findView(paper);
            refBBox = new g.Rect(0, 0, WIDTH, HEIGHT);
            node = cellView.el.querySelector('text');
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        QUnit.module('useNoBreakSpace', function() {

            QUnit.test('false by default', function(assert) {

                const text = joint.dia.attributes['text'];
                text.set.call(cellView, '  text  ', refBBox, node, {});
                assert.equal(node.textContent, '  text  ', 'Text uses normal whitespace character');
            });

            QUnit.test('true', function(assert) {

                const text = joint.dia.attributes['text'];
                text.set.call(cellView, '  text  ', refBBox, node, { 'use-no-break-space': true });
                assert.equal(node.textContent, V.sanitizeText('  text  '), 'Text uses non-breaking whitespace character');
            });
        });

        QUnit.module('textWrap', function() {

            QUnit.test('qualify', function(assert) {

                var textWrap = joint.dia.attributes['text-wrap'];
                assert.notOk(textWrap.qualify.call(cellView, 'string', node, {}));
                assert.ok(textWrap.qualify.call(cellView, { 'plainObject': true }, node, {}));
            });

            QUnit.test('set', function(assert) {

                var textWrap = joint.dia.attributes['text-wrap'];
                var bbox = refBBox.clone();
                var spy = sinon.spy(joint.util, 'breakText');

                // no text
                spy.resetHistory();
                textWrap.set.call(cellView, {}, bbox, node, {});
                assert.equal(node.textContent, '-'); // Vectorizer empty line has `-` character with opacity 0

                // text via `text` attribute
                spy.resetHistory();
                textWrap.set.call(cellView, {}, bbox, node, { text: 'text' });
                assert.equal(node.textContent, 'text');

                // text as part of the `textWrap` value
                spy.resetHistory();
                textWrap.set.call(cellView, { text: 'text' }, bbox, node, {});
                assert.equal(node.textContent, 'text');

                // width & height absolute
                spy.resetHistory();
                textWrap.set.call(cellView, { text: 'text', width: -20, height: -30, breakText: spy }, bbox, node, {});
                assert.ok(spy.calledWith(sinon.match.string, sinon.match(function(obj) {
                    return obj.width === WIDTH - 20 && obj.height === HEIGHT - 30;
                })));

                // width & height relative
                spy.resetHistory();
                textWrap.set.call(cellView, { text: 'text', width: '50%', height: '200%', breakText: spy }, bbox, node, {});
                assert.ok(spy.calledWith(sinon.match.string, sinon.match(function(obj) {
                    return obj.width === WIDTH / 2 && obj.height === HEIGHT * 2;
                })));

                // width & height no restriction
                spy.resetHistory();
                textWrap.set.call(cellView, { text: 'text', width: null, height: null, breakText: spy }, bbox, node, {});
                assert.ok(spy.calledWith(sinon.match.string, sinon.match(function(obj) {
                    return obj.width === Infinity && obj.height === undefined;
                })));

                // width & height calc()
                spy.resetHistory();
                textWrap.set.call(cellView, { text: 'text', width: 'calc(w-11)', height: 'calc(h-13)', breakText: spy }, bbox, node, {});
                assert.ok(spy.calledWith(sinon.match.string, sinon.match(function(obj) {
                    return obj.width === refBBox.width - 11 && obj.height === refBBox.height - 13;
                })));

                spy.restore();
            });

            QUnit.test('takes external CSS into account', function(assert) {

                const spy = sinon.spy(joint.util, 'breakText');

                // no text
                const fontSize = '23px';
                const fontFamily = 'Arial';
                const fontWeight = '800';
                const letterSpacing = '5px';
                const textTransform = 'uppercase';
                const stylesheet = V.createSVGStyle(`
                    text {
                        font-size: ${fontSize};
                        font-family: ${fontFamily};
                        font-weight: ${fontWeight};
                        letter-spacing: ${letterSpacing};
                        text-transform: ${textTransform};
                    }
                `);
                paper.svg.prepend(stylesheet);

                const el = new joint.shapes.standard.Rectangle({
                    attrs: {
                        label: {
                            text: 'text',
                            textWrap: {
                                breakText: spy
                            }
                        }
                    }

                });
                el.addTo(graph);
                paper.requireView(el);

                assert.ok(spy.calledWith(
                    sinon.match.string,
                    sinon.match.object,
                    sinon.match((obj) => {
                        return (
                            obj['font-size'] === fontSize &&
                            obj['font-family'] === fontFamily &&
                            obj['letter-spacing'] === letterSpacing &&
                            obj['text-transform'] === textTransform &&
                            obj['font-weight'] === fontWeight
                        );
                    })));

                stylesheet.remove();
                spy.restore();
            });

            QUnit.test('measures correctly when not in the render tree', function(assert) {

                const spy = sinon.spy(joint.util, 'breakText');

                // Remove the paper from the DOM render tree
                paper.el.style.display = 'none';

                const el = new joint.shapes.standard.Rectangle({
                    attrs: {
                        label: {
                            text: 'text',
                            textWrap: {
                                breakText: spy
                            }
                        }
                    }

                });
                el.addTo(graph);

                assert.ok(spy.calledOnce);
                assert.ok(spy.calledWith(
                    sinon.match.string,
                    sinon.match.object,
                    sinon.match.object,
                    sinon.match((obj) => {
                        return (
                            obj['svgDocument'] == null
                        );
                    })
                ));

                // Restore the paper to the DOM render tree
                paper.el.style.display = '';

                spy.resetHistory();

                el.attr('label/text', 'text2');

                assert.ok(spy.calledOnce);
                assert.ok(spy.calledWith(
                    sinon.match.string,
                    sinon.match.object,
                    sinon.match.object,
                    sinon.match((obj) => {
                        const svgDocument = obj['svgDocument'];
                        return (
                            svgDocument instanceof SVGSVGElement &&
                            svgDocument.checkVisibility()
                        );
                    })
                ));

            });

            QUnit.test('x', function(assert) {
                var TestElement = joint.dia.Element.define('Test', {
                    size: {
                        width: 100,
                        height: 100
                    },
                    attrs: {
                        text: {
                            text: 'a b c d e f g h c d f g h',
                            x: 'calc(0.5*w+1)',
                            textWrap: {
                                width: -20,
                                maxLineCount: 2
                            }
                        }
                    }
                }, {
                    markup: [{
                        tagName: 'text',
                        selector: 'text'
                    }]
                });

                var el = new TestElement();
                el.addTo(graph);
                var view = el.findView(paper);
                var text = view.findNode('text');
                var tspans = text.childNodes;
                assert.equal(text.getAttribute('x'), '51');
                assert.equal(tspans[0].getAttribute('x'), null);
                assert.equal(tspans[1].getAttribute('x'), '51');
            });

        });
    });

    QUnit.module('Proxy Attributes', function(hooks) {

        var paper, graph, cell, cellView;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            var fixtures = document.getElementById('qunit-fixture');
            var paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle({ width: 100, height: 100 });
            cell.addTo(graph);
            cellView = cell.findView(paper);
        });

        hooks.afterEach(function() {
            paper.remove();
        });


        QUnit.module('containerSelector', function() {

            QUnit.test('highlighting', function(assert) {

                paper.options.embeddingMode = true;
                cell.attr(['root', 'containerSelector'], 'body');
                var body = cellView.findNode('body');

                var highlightSpy = sinon.spy();
                var unhighlightSpy = sinon.spy();
                paper.on('cell:highlight', highlightSpy);
                paper.on('cell:unhighlight', unhighlightSpy);

                var cell2 = new joint.shapes.standard.Rectangle({ width: 100, height: 100 });
                cell2.addTo(graph);
                var cellView2 = cell2.findView(paper);
                var data = {};
                var clientCellCenter = paper.localToClientPoint(cell.getBBox().center());
                simulate.mousedown({ el: cellView2.el, clientX: clientCellCenter.x, clientY: clientCellCenter.y, data: data });
                simulate.mousemove({ el: cellView2.el, clientX: clientCellCenter.x, clientY: clientCellCenter.y, data: data });
                // Highlight
                assert.ok(highlightSpy.calledOnce);
                assert.ok(highlightSpy.calledWithExactly(cellView, body, sinon.match({ embedding: true })));
                assert.notOk(unhighlightSpy.called);
                simulate.mouseup({ el: cellView2.el, clientX: clientCellCenter.x, clientY: clientCellCenter.y, data: data });
                // Unhighlight
                assert.ok(unhighlightSpy.calledOnce);
                assert.ok(unhighlightSpy.calledWithExactly(cellView, body, sinon.match({ embedding: true })));
                assert.notOk(highlightSpy.callCount > 1);
            });
        });

        QUnit.module('magnetSelector', function() {

            QUnit.test('highlighting, magnet, validation', function(assert) {

                cell.attr(['root', 'magnetSelector'], 'body');
                var body = cellView.findNode('body');

                var highlightSpy = sinon.spy();
                var unhighlightSpy = sinon.spy();
                var validateSpy = sinon.spy(function() { return true; });
                paper.on('cell:highlight', highlightSpy);
                paper.on('cell:unhighlight', unhighlightSpy);
                paper.options.validateConnection = validateSpy;

                var link = new joint.shapes.standard.Link();
                link.addTo(graph);
                var linkView = link.findView(paper);
                assert.equal(linkView.sourceMagnet, null);
                var cellCenter = cell.getBBox().center();
                var evt = { type: 'mousemove' };
                linkView.startArrowheadMove('source');
                evt.target = paper.el;
                linkView.pointermove(evt, cellCenter.x, cellCenter.y);
                evt.target = cellView.el;
                linkView.pointermove(evt, cellCenter.x, cellCenter.y);
                // Highlight
                assert.ok(highlightSpy.calledOnce);
                assert.ok(highlightSpy.calledWithExactly(cellView, cellView.el, sinon.match({ connecting: true, type: joint.dia.CellView.Highlighting.CONNECTING })));
                assert.notOk(unhighlightSpy.called);
                linkView.pointerup(evt, cellCenter.x, cellCenter.y);
                // Unhighlight
                assert.ok(unhighlightSpy.calledOnce);
                assert.ok(unhighlightSpy.calledWithExactly(cellView, cellView.el, sinon.match({ connecting: true, type: joint.dia.CellView.Highlighting.CONNECTING })));
                assert.notOk(highlightSpy.callCount > 1);
                assert.equal(linkView.sourceMagnet, body);
                // Validation
                assert.ok(validateSpy.calledOnce);
                assert.ok(validateSpy.calledWithExactly(cellView, undefined, undefined, undefined, 'source', linkView));
            });
        });

        QUnit.module('highlighterSelector', function() {

            QUnit.test('highlighting, magnet, validation', function(assert) {

                cell.attr(['root', 'highlighterSelector'], 'body');
                var body = cellView.findNode('body');

                var highlightSpy = sinon.spy();
                var unhighlightSpy = sinon.spy();
                var validateSpy = sinon.spy(function() { return true; });

                paper.on('cell:highlight', highlightSpy);
                paper.on('cell:unhighlight', unhighlightSpy);
                paper.options.validateConnection = validateSpy;

                var link = new joint.shapes.standard.Link();
                link.addTo(graph);
                var linkView = link.findView(paper);
                assert.equal(linkView.sourceMagnet, null);
                var cellCenter = cell.getBBox().center();
                var evt = { type: 'mousemove' };
                linkView.startArrowheadMove('source');
                evt.target = paper.el;
                linkView.pointermove(evt, cellCenter.x, cellCenter.y);
                evt.target = cellView.el;
                linkView.pointermove(evt, cellCenter.x, cellCenter.y);
                // Highlight
                assert.ok(highlightSpy.calledOnce);
                assert.ok(highlightSpy.calledWithExactly(cellView, body, sinon.match({ connecting: true })));
                assert.notOk(unhighlightSpy.called);
                linkView.pointerup(evt, cellCenter.x, cellCenter.y);
                // Unhighlight
                assert.ok(unhighlightSpy.calledOnce);
                assert.ok(unhighlightSpy.calledWithExactly(cellView, body, sinon.match({ connecting: true })));
                assert.notOk(highlightSpy.callCount > 1);
                assert.equal(linkView.sourceMagnet, null);
                // Validation
                assert.ok(validateSpy.calledOnce);
                assert.ok(validateSpy.calledWithExactly(cellView, undefined, undefined, undefined, 'source', linkView));
            });

            QUnit.test('port highlighting, validation', function(assert) {

                cell.prop('ports', {
                    groups: {
                        'group1': {
                            markup: [{
                                position: 'bottom',
                                tagName: 'rect',
                                selector: 'portBody',
                                attributes: {
                                    'width': 20,
                                    'height': 20,
                                    'x': -10,
                                    'y': -10,
                                    'fill': 'white',
                                    'stroke': 'black'
                                }
                            }],
                            attrs: {
                                portBody: {
                                    highlighterSelector: 'root',
                                    magnet: true,
                                    rx: 10,
                                    ry: 10
                                }
                            }
                        }
                    }
                });

                cell.addPort({ id: 'port1', group: 'group1' });

                var body = cellView.findPortNode('port1', 'portBody');
                var root = cellView.findPortNode('port1', 'root');

                var highlightSpy = sinon.spy();
                var unhighlightSpy = sinon.spy();
                var validateSpy = sinon.spy(function() { return true; });

                paper.on('cell:highlight', highlightSpy);
                paper.on('cell:unhighlight', unhighlightSpy);
                paper.options.validateConnection = validateSpy;

                var link = new joint.shapes.standard.Link();
                link.addTo(graph);
                var linkView = link.findView(paper);
                assert.equal(linkView.sourceMagnet, null);
                var portPosition = cell.getPortsPositions('group1')['port1'];
                var portCenter = cell.position().offset(portPosition.x, portPosition.y);
                var evt = { type: 'mousemove' };
                linkView.startArrowheadMove('source');
                evt.target = paper.el;
                linkView.pointermove(evt, portCenter.x, portCenter.y);
                evt.target = body;
                linkView.pointermove(evt, portCenter.x, portCenter.y);
                // Highlight
                assert.ok(highlightSpy.calledOnce);
                assert.ok(highlightSpy.calledWithExactly(cellView, root, sinon.match({ connecting: true })));
                assert.notOk(unhighlightSpy.called);
                linkView.pointerup(evt, portCenter.x, portCenter.y);
                // Unhighlight
                assert.ok(unhighlightSpy.calledOnce);
                assert.ok(unhighlightSpy.calledWithExactly(cellView, root, sinon.match({ connecting: true })));
                assert.notOk(highlightSpy.callCount > 1);
                assert.equal(linkView.sourceMagnet, body);
                // Validation
                assert.ok(validateSpy.calledOnce);
                assert.ok(validateSpy.calledWithExactly(cellView, body, undefined, undefined, 'source', linkView));
            });
        });


    });

    QUnit.module('Unset Attributes', function(hooks) {

        var paper, graph, cell, cellView;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            var fixtures = document.getElementById('qunit-fixture');
            var paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle();
            cell.addTo(graph);
            cellView = cell.findView(paper);
            // custom presentation attributes
            joint.dia.attributes.test1 = { set: 'test2' };
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        QUnit.test('unset() callback', function(assert) {
            const unsetSpy = sinon.spy();
            joint.dia.attributes['test-attribute'] = {
                unset: unsetSpy
            };
            cell.attr('body/fill', 'purple');
            assert.ok(unsetSpy.notCalled);
            cell.attr('body/testAttribute', 'test');
            assert.ok(unsetSpy.notCalled);
            cell.attr('body/testAttribute', null);
            assert.ok(unsetSpy.calledOnce);
            assert.ok(unsetSpy.calledWithExactly(
                cellView.findNode('body'),
                sinon.match({ 'test-attribute': null, fill: 'purple' }),
                cellView
            ));
            delete joint.dia.attributes['test-attribute'];
        });

        QUnit.module('unset() single attribute', function() {
            QUnit.test('string', function(assert) {
                joint.dia.attributes['test-attribute'] = {
                    set: 'a',
                    unset: 'a'
                };
                cell.attr('body/testAttribute', 'value');
                const bodyNode = cellView.findNode('body');
                assert.equal(bodyNode.getAttribute('a'), 'value');
                cell.attr('body/testAttribute', null);
                assert.notOk(bodyNode.getAttribute('a'));
                delete joint.dia.attributes['test-attribute'];
            });
            QUnit.test('function', function(assert) {
                joint.dia.attributes['test-attribute'] = {
                    set: function(value) {
                        return { a: value };
                    },
                    unset: function() {
                        return 'a';
                    }
                };
                cell.attr('body/testAttribute', 'value');
                const bodyNode = cellView.findNode('body');
                assert.equal(bodyNode.getAttribute('a'), 'value');
                cell.attr('body/testAttribute', null);
                assert.notOk(bodyNode.getAttribute('a'));
                delete joint.dia.attributes['test-attribute'];
            });
        });

        QUnit.module('unset() multiple attributes', function() {
            QUnit.test('string', function(assert) {
                joint.dia.attributes['test-attribute'] = {
                    set: function(value) {
                        return { a: value, b: value };
                    },
                    unset: ['a', 'b']
                };
                cell.attr('body/testAttribute', 'value');
                const bodyNode = cellView.findNode('body');
                assert.equal(bodyNode.getAttribute('a'), 'value');
                assert.equal(bodyNode.getAttribute('b'), 'value');
                cell.attr('body/testAttribute', null);
                assert.notOk(bodyNode.getAttribute('a'));
                assert.notOk(bodyNode.getAttribute('b'));
            });
            QUnit.test('function', function(assert) {
                joint.dia.attributes['test-attribute'] = {
                    set: function(value) {
                        return { a: value, b: value };
                    },
                    unset: function() {
                        return ['a', 'b'];
                    }
                };
                cell.attr('body/testAttribute', 'value');
                const bodyNode = cellView.findNode('body');
                assert.equal(bodyNode.getAttribute('a'), 'value');
                assert.equal(bodyNode.getAttribute('b'), 'value');
                cell.attr('body/testAttribute', null);
                assert.notOk(bodyNode.getAttribute('a'));
                assert.notOk(bodyNode.getAttribute('b'));
                delete joint.dia.attributes['test-attribute'];
            });
        });

        [{
            attribute: 'no-def'
        }, {
            attribute: 'fill',
            label: 'with-def',
            value: 'blue',
        }, {
            attribute: 'test1',
            label: 'alias',
            svgAttribute: 'test2',
        }, {
            attribute: 'sourceMarker',
            svgAttribute: 'marker-start',
            value: { type: 'path', d: 'M 0 0 10 10' }
        }, {
            attribute: 'targetMarker',
            svgAttribute: 'marker-end',
            value: { type: 'path', d: 'M 0 0 10 10' }
        }, {
            attribute: 'vertexMarker',
            svgAttribute: 'marker-mid',
            value: { type: 'path', d: 'M 0 0 10 10' }
        }, {
            attribute: 'refD',
            svgAttribute: 'd',
            value: 'M 0 0 10 10',
        }, {
            attribute: 'refPoints',
            svgAttribute: 'points',
            value: '0,0 10,10',
        }].forEach(function({
            attribute,
            label = attribute,
            svgAttribute = attribute,
            value = true
        }) {
            QUnit.test(`attribute: ${label}`, function(assert) {
                const path = ['body', attribute];
                const bodyNode = cellView.findNode('body');
                // set
                cell.attr(path, value);
                assert.ok(bodyNode.getAttribute(svgAttribute));
                // unset
                cell.attr(path, null);
                assert.notOk(bodyNode.getAttribute(svgAttribute));
            });
        });

        [{
            test1: null, // unset `test2`
            test2: 'test3'
        }, {
            test2: 'test3',
            test1: null, // unset `test2`
        }].forEach(function(attributes, index) {
            QUnit.test(`unset order: ${index + 1}`, function(assert) {
                cell.attr('body', attributes);
                const bodyNode = cellView.findNode('body');
                assert.ok(bodyNode.getAttribute('test2'));
            });
        });

        QUnit.test('attribute: title', function(assert) {
            cell.attr('body/title', 'test');
            const bodyNode = cellView.findNode('body');
            assert.ok(bodyNode.querySelector('title'));
            cell.attr('body/title', null);
            assert.notOk(bodyNode.querySelector('title'));
        });

        QUnit.test('attribute: text', function(assert) {
            cell.attr('label/text', 'test');
            const textNode = cellView.findNode('label');
            assert.ok(textNode.firstChild);
            cell.attr('label/text', null);
            assert.notOk(textNode.firstChild);
            cell.attr('label/text', '');
            assert.ok(textNode.firstChild);
        });

        QUnit.test('attribute: html', function(assert) {
            cell.set('markup', joint.util.svg`
                <foreignObject>
                    <div xmlns="http://www.w3.org/1999/xhtml" @selector="div">test</div>
                </foreignObject>
            `);
            const divNode = cellView.findNode('div');
            assert.ok(divNode);
            cell.attr('div/html', 'test');
            assert.ok(divNode.firstChild);
            cell.attr('div/html', null);
            assert.notOk(divNode.firstChild);
        });

        QUnit.test('unset transform & position callback', function(assert) {
            joint.dia.attributes['test-transform-attribute'] = {
                unset: 'transform',
                set: function(value) {
                    return { transform: `translate(${value},${value})` };
                }
            };
            joint.dia.attributes['test-position-attribute'] = {
                position(value) {
                    return new g.Point(value, value);
                }
            };

            // set transform attribute
            cell.attr('body/testTransformAttribute', 7);
            const bodyNode = cellView.findNode('body');
            assert.ok(bodyNode.getAttribute('transform'));
            assert.deepEqual(V(bodyNode).translate(), { tx: 7, ty: 7 });
            // unset transform attribute
            cell.attr('body/testTransformAttribute', null);
            assert.notOk(bodyNode.getAttribute('transform'));
            assert.deepEqual(V(bodyNode).translate(), { tx: 0, ty: 0 });
            // position attribute and deleted transform
            cell.attr('body/testPositionAttribute', 11);
            assert.deepEqual(V(bodyNode).translate(), { tx: 11, ty: 11 });
            // position and set transform attribute
            cell.attr('body/testTransformAttribute', 13);
            assert.deepEqual(V(bodyNode).translate(), { tx: 13 + 11, ty: 13 + 11 });

            delete joint.dia.attributes['test-transform-attribute'];
            delete joint.dia.attributes['test-position-attribute'];
        });
    });


    QUnit.module('Calc()', function(hooks) {

        var X = 13;
        var Y = 17;
        var WIDTH = 85;
        var HEIGHT = 97;

        var refBBox;

        hooks.beforeEach(function() {
            refBBox = new g.Rect(X, Y, WIDTH, HEIGHT);
        });

        QUnit.test('calculates an expression', function(assert) {
            [
                // sanity
                ['', ''],
                ['M 0 0 10 10', 'M 0 0 10 10'],
                ['calc(w)', String(WIDTH)],
                ['calc(h)', String(HEIGHT)],
                ['calc(s)', String(Math.min(WIDTH, HEIGHT))],
                ['calc(l)', String(Math.max(WIDTH, HEIGHT))],
                ['calc(d)', String(Math.sqrt(WIDTH * WIDTH + HEIGHT * HEIGHT))],
                ['calc(x)', String(X)],
                ['calc(y)', String(Y)],
                // multiply
                ['calc(2*w)', String(WIDTH * 2)],
                ['calc(2*h)', String(HEIGHT * 2)],
                ['calc(0.5*w)', String(WIDTH / 2)],
                ['calc(0.5*h)', String(HEIGHT / 2)],
                ['calc(-.5*w)', String(WIDTH / -2)],
                ['calc(-.5*h)', String(HEIGHT / -2)],
                ['calc(1e-1*w)', String(WIDTH * 1e-1)],
                ['calc(1e-1*h)', String(HEIGHT * 1e-1)],
                // add
                ['calc(w+10)', String(WIDTH + 10)],
                ['calc(h+10)', String(HEIGHT + 10)],
                ['calc(w+10.5)', String(WIDTH + 10.5)],
                ['calc(h+10.5)', String(HEIGHT + 10.5)],
                ['calc(w-10)', String(WIDTH - 10)],
                ['calc(h-10)', String(HEIGHT - 10)],
                ['calc(2*w+10)', String(WIDTH * 2 + 10)],
                ['calc(2*h+10)', String(HEIGHT * 2 + 10)],
                ['calc(w+-10)', String(WIDTH - 10)],
                ['calc(h--10)', String(HEIGHT + 10)],
                // division
                ['calc(w/2)', String(WIDTH / 2)],
                ['calc(h/3)', String(HEIGHT / 3)],
                ['calc(w/2.5)', String(WIDTH / 2.5)],
                ['calc(w/1e-1)', String(WIDTH / 1e-1)],
                ['calc(3*w/2)', String(3 * WIDTH / 2)],
                ['calc(4*w/2+1)', String(4 * WIDTH / 2 + 1)],
                ['calc(4*w/2-1)', String(4 * WIDTH / 2 - 1)],
                // spaces
                ['calc( 2 * w + 10 )', String(WIDTH * 2 + 10)],
                ['calc( 2 * h + 10 )', String(HEIGHT * 2 + 10)],
                ['calc( 3 * w / 2 + 10 )', String(WIDTH * 3 / 2 + 10)],
                // multiple expressions
                ['M 0 0 calc(w) calc(h) 200 200', 'M 0 0 ' + WIDTH + ' ' + HEIGHT + ' 200 200'],
                ['M 0 0 calc(w+10) calc(h+10)', 'M 0 0 ' + (WIDTH + 10) + ' ' + (HEIGHT + 10)],
                ['M 0 0 calc(1*w-10) calc(1*h-10)', 'M 0 0 ' + (WIDTH - 10) + ' ' + (HEIGHT - 10)],
                // nested expression
                ['calc(w+calc(x))', String(WIDTH + X)],
                ['calc(h+calc(y))', String(HEIGHT + Y)],
                ['M 0 0 calc(w + calc(h)) 0', 'M 0 0 ' + (WIDTH + HEIGHT) + ' 0'],
                ['M 0 0 calc(calc(h) * w + calc(h)) 0', 'M 0 0 ' + (HEIGHT * WIDTH + HEIGHT) + ' 0'],
                ['M 0 0 calc(w + calc(h + calc(w))) 0', 'M 0 0 ' + (WIDTH + HEIGHT + WIDTH) + ' 0'],
                ['M 0 0 calc(2 * w + calc(h)) calc(3 * w + calc(h))', 'M 0 0 ' + (2 * WIDTH + HEIGHT) + ' ' + (3 * WIDTH + HEIGHT)],
            ].forEach(function(testCase) {
                assert.equal(joint.dia.CellView.evalAttribute('d', testCase[0], refBBox.clone()), testCase[1]);
            });
        });

        QUnit.test('throws error when invalid', function(assert) {
            [
                'calc()',
                'calc(10)',
                'calc(w+(10))',
                'calc(2*i+10)',
                'calc(10+2*w)',
                'calc(10 0',
            ].forEach(function(testCase) {
                assert.throws(
                    function() {
                        joint.dia.CellView.evalAttribute('d', testCase, refBBox.clone());
                    },
                    /Invalid calc\(\) expression/,
                    testCase
                );
            });
        });

        QUnit.test('prevent negative values for dimensions', function(assert) {
            var attributes = [
                'x',
                'y',
                'cx',
                'cy',
                'dx',
                'dy',
                'x1',
                'x2',
                'y1',
                'y2',
                'width',
                'height',
                'rx',
                'ry',
                'r',
            ];
            var results = [
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0,
            ];
            attributes.forEach(function(attribute, index) {
                const result = joint.dia.CellView.evalAttribute(attribute, `calc(w-${refBBox.width + 1})`, refBBox.clone());
                assert.equal(result, String(results[index]), attribute);
            });
        });

    });

    QUnit.module('Defs Attributes', function(hooks) {

        var paper, graph, cell, cellView;
        var idRegex = /^url\(#(.+)\)$/;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            var fixtures = document.getElementById('qunit-fixture');
            var paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle();
            cell.addTo(graph);
            cellView = cell.findView(paper);
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        QUnit.module('markers', function() {

            QUnit.test('sourceMarker - string markup', function(assert) {

                cell.attr('body/sourceMarker', {
                    markup: '<circle r="10" test-content-attribute="true"/>',
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-start');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> circle
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                assert.equal(markerNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerNodeChildren[0].attr('transform'), undefined);
            });

            QUnit.test('sourceMarker - json markup', function(assert) {

                cell.attr('body/sourceMarker', {
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'r': 10,
                            'test-content-attribute': true
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-start');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> circle
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                assert.equal(markerNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerNodeChildren[0].attr('transform'), undefined);
            });

            QUnit.test('targetMarker - string markup', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: '<circle cx="6" cy="0" r="10" test-content-attribute="true" />',
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> circle (auto-rotate)
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                assert.equal(markerNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerNodeChildren[0].attr('transform'), 'rotate(180)');
            });

            QUnit.test('targetMarker - string markup - two sibling elements', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: '<circle cx="6" cy="0" r="10" test-content-attribute="true" /><circle cx="6" cy="0" r="10" test-content-attribute="true" />',
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> g (auto-rotate) -> circle + circle
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                var markerContentNode = markerNodeChildren[0];
                assert.equal(markerContentNode.tagName(), 'G');
                assert.equal(markerContentNode.attr('transform'), 'rotate(180)');
                var markerContentNodeChildren = V(markerContentNode).children();
                assert.equal(markerContentNodeChildren.length, 2);
                assert.equal(markerContentNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[0].attr('transform'), undefined);
                assert.equal(markerContentNodeChildren[1].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[1].attr('transform'), undefined);
            });

            QUnit.test('targetMarker - json markup', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> circle (auto-rotate)
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                assert.equal(markerNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerNodeChildren[0].attr('transform'), 'rotate(180)');
            });

            QUnit.test('targetMarker - json markup - two sibling elements', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true
                        }
                    }, {
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> g (auto-rotate) -> circle + circle
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                var markerContentNode = markerNodeChildren[0];
                assert.equal(markerContentNode.tagName(), 'G');
                assert.equal(markerContentNode.attr('transform'), 'rotate(180)');
                var markerContentNodeChildren = V(markerContentNode).children();
                assert.equal(markerContentNodeChildren.length, 2);
                assert.equal(markerContentNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[0].attr('transform'), undefined);
                assert.equal(markerContentNodeChildren[1].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[1].attr('transform'), undefined);
            });

            QUnit.test('targetMarker - combining manual transform value with auto-rotate', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true,
                            'transform': 'translate(10,10) rotate(90) scale(2)'
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> circle (auto-rotate . manual transform)
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                assert.equal(markerNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerNodeChildren[0].attr('transform'), 'rotate(180) translate(10,10) rotate(90) scale(2)');
            });

            QUnit.test('targetMarker - combining manual transform value with auto-rotate - two sibling elements', function(assert) {

                cell.attr('body/targetMarker', {
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true,
                            'transform': 'rotate(90)'
                        }
                    }, {
                        tagName: 'circle',
                        attributes: {
                            'cx': 6,
                            'cy': 0,
                            'r': 10,
                            'test-content-attribute': true,
                            'transform': 'scale(2)'
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-end');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
                // structure: marker node -> g (auto-rotate) -> circle (manual rotate) + circle (manual scale)
                var markerNodeChildren = V(markerNode).children();
                assert.equal(markerNodeChildren.length, 1);
                var markerContentNode = markerNodeChildren[0];
                assert.equal(markerContentNode.tagName(), 'G');
                assert.equal(markerContentNode.attr('transform'), 'rotate(180)');
                var markerContentNodeChildren = V(markerContentNode).children();
                assert.equal(markerContentNodeChildren.length, 2);
                assert.equal(markerContentNodeChildren[0].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[0].attr('transform'), 'rotate(90)');
                assert.equal(markerContentNodeChildren[1].tagName(), 'CIRCLE');
                assert.equal(markerContentNodeChildren[1].attr('transform'), 'scale(2)');
            });

            QUnit.test('vertexMarker - with type and id', function(assert) {

                cell.attr('body/vertexMarker', {
                    id: 'marker-test',
                    type: 'circle',
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('marker-mid');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(id, 'marker-test');
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'MARKER');
                assert.equal(V(markerNode).children()[0].tagName(), 'CIRCLE');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
            });

        });

        QUnit.module('patterns', function() {

            QUnit.test('fill - string markup', function(assert) {

                cell.attr('body/fill', {
                    type: 'pattern',
                    markup: '<circle r="10" test-content-attribute="true"/>',
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('fill');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'PATTERN');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
            });

            QUnit.test('stroke - json markup', function(assert) {

                cell.attr('body/stroke', {
                    type: 'pattern',
                    markup: [{
                        tagName: 'circle',
                        attributes: {
                            'r': 10,
                            'test-content-attribute': true
                        }
                    }],
                    attrs: {
                        'test-attribute': true
                    }
                });

                var bodyNode = cellView.findNode('body');
                var markerAttribute = bodyNode.getAttribute('stroke');
                var match = idRegex.exec(markerAttribute);
                assert.ok(match);
                var id = match[1];
                assert.ok(paper.el.querySelector('[test-attribute="true"]'));
                assert.ok(paper.isDefined(id));
                var markerNode = paper.svg.getElementById(id);
                assert.equal(V(markerNode).tagName(), 'PATTERN');
                assert.equal(markerNode.getAttribute('test-attribute'), 'true');
                assert.ok(markerNode.querySelector('[test-content-attribute="true"]'));
            });

        });
    });

    QUnit.module('Property Attributes', function(hooks) {

        var paper, graph, cell;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            const fixtures = document.getElementById('qunit-fixture');
            const paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle();
            cell.addTo(graph);
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        function createForeignObjectShape(markup) {
            const fo = new joint.dia.Element({
                type: 'foreignObjectElement',
                attrs: {
                    foreignObject: {
                        width: 'calc(w)',
                        height: 'calc(h)',
                    }
                },
                markup:  joint.util.svg/*xml*/`
                    <foreignObject @selector="foreignObject">${markup}</foreignObject>
                `
            });
            graph.addCell(fo);
            return fo;
        }

        QUnit.module('value', function(assert) {

            QUnit.test('<input/>', function(assert) {
                const fo = createForeignObjectShape('<input @selector="input" type="text"/>');
                const inputNode = paper.svg.querySelector('input');
                assert.equal(inputNode.value, '');
                fo.attr('input/props/value', 'foo');
                assert.equal(inputNode.value, 'foo');
                assert.strictEqual(inputNode.getAttribute('value'), null);
            });

            QUnit.test('<textarea/>', function(assert) {
                const fo = createForeignObjectShape('<textarea @selector="textarea"></textarea>');
                const textareaNode = paper.svg.querySelector('textarea');
                assert.equal(textareaNode.value, '');
                fo.attr('textarea/props/value', 'foo');
                assert.equal(textareaNode.value, 'foo');
                assert.strictEqual(textareaNode.getAttribute('value'), null);
            });

            QUnit.test('<select/>', function(assert) {
                const fo = createForeignObjectShape(`
                    <select @selector="select">
                        <option value="foo">Foo</option>
                        <option value="bar">Bar</option>
                    </select>
                `);
                const selectNode = paper.svg.querySelector('select');
                assert.equal(selectNode.value, 'foo');
                fo.attr('select/props/value', 'bar');
                assert.equal(selectNode.value, 'bar');
                assert.strictEqual(selectNode.getAttribute('value'), null);
            });

            QUnit.test('<select multiple/>', function(assert) {
                const fo = createForeignObjectShape(`
                    <select @selector="select" multiple="true">
                        <option value="foo">Foo</option>
                        <option value="bar">Bar</option>
                        <option value="baz">Baz</option>
                    </select>
                `);
                const selectNode = paper.svg.querySelector('select');
                assert.notOk(selectNode.options[0].selected);
                assert.notOk(selectNode.options[1].selected);
                assert.notOk(selectNode.options[1].selected);
                fo.attr('select/props/value', ['foo', 'bar']);
                assert.ok(selectNode.options[0].selected);
                assert.ok(selectNode.options[1].selected);
                assert.notOk(selectNode.options[2].selected);
            });
        });

        QUnit.module('checked', function(assert) {

            QUnit.test('<input type="checkbox"/>', function(assert) {
                const fo = createForeignObjectShape('<input @selector="input" type="checkbox"/>');
                const inputNode = paper.svg.querySelector('input');
                assert.equal(inputNode.checked, false);
                fo.attr('input/props/checked', true);
                assert.equal(inputNode.checked, true);
                assert.strictEqual(inputNode.getAttribute('checked'), null);
            });

            QUnit.test('<input type="radio"/>', function(assert) {
                const fo = createForeignObjectShape('<input @selector="input" type="radio" name="radio"/>');
                const inputNode = paper.svg.querySelector('input');
                assert.equal(inputNode.checked, false);
                fo.attr('input/props/checked', true);
                assert.equal(inputNode.checked, true);
                assert.strictEqual(inputNode.getAttribute('checked'), null);
            });
        });

        QUnit.module('disabled', function(assert) {

            QUnit.test('<input/>', function(assert) {
                const fo = createForeignObjectShape('<input @selector="input" type="text"/>');
                const inputNode = paper.svg.querySelector('input');
                assert.equal(inputNode.disabled, false);
                fo.attr('input/props/disabled', true);
                assert.equal(inputNode.disabled, true);
            });
        });

        QUnit.module('readOnly', function(assert) {

            QUnit.test('<input/>', function(assert) {
                const fo = createForeignObjectShape('<input @selector="input" type="text"/>');
                const inputNode = paper.svg.querySelector('input');
                assert.equal(inputNode.readOnly, false);
                fo.attr('input/props/readOnly', true);
                assert.equal(inputNode.readOnly, true);
            });
        });

        QUnit.module('selected', function(assert) {

            QUnit.test('<option/>', function(assert) {
                const fo = createForeignObjectShape(`
                    <select @selector="select">
                        <option @selector="option1" value="foo">Foo</option>
                        <option @selector="option2" value="bar">Bar</option>
                    </select>
                `);
                const selectNode = paper.svg.querySelector('select');
                assert.equal(selectNode.value, 'foo');
                fo.attr('option2/props/selected', true);
                assert.equal(selectNode.value, 'bar');
            });
        });

        QUnit.module('contentEditable', function(assert) {

            QUnit.test('<div/>', function(assert) {
                const fo = createForeignObjectShape('<div class="test-div" @selector="div">foo</div>');
                const divNode = paper.svg.querySelector('.test-div');
                assert.notOk(divNode.isContentEditable);
                fo.attr('div/props/contentEditable', true);
                assert.ok(divNode.isContentEditable);
            });
        });
    });

    QUnit.module('Title Attribute', function(hooks) {

        var paper, graph, cell, cellView;

        hooks.beforeEach(function() {
            graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
            const fixtures = document.getElementById('qunit-fixture');
            const paperEl = document.createElement('div');
            fixtures.appendChild(paperEl);
            paper = new joint.dia.Paper({ el: paperEl, model: graph, cellViewNamespace: joint.shapes });
            cell = new joint.shapes.standard.Rectangle();
            cell.addTo(graph);
            cellView = cell.findView(paper);
        });

        hooks.afterEach(function() {
            paper.remove();
        });

        QUnit.test('used on <g>', function(assert) {
            let titleText;
            assert.equal(cellView.el.querySelectorAll('title').length, 0);
            titleText = 'test-title';
            cell.attr('root/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, titleText);
            titleText = 'test-title-2';
            cell.attr('root/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, titleText);
        });

        QUnit.test('used on <title>', function(assert) {
            let titleText;
            cell.set('markup', [
                { tagName: 'title', selector: 'title' },
                { tagName: 'rect', selector: 'body' },
                { tagName: 'text', selector: 'label' }
            ]);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            titleText = 'test-title';
            cell.attr('title/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, titleText);
            titleText = 'test-title-2';
            cell.attr('title/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, titleText);
        });

        QUnit.test('used on element with text node', function(assert) {
            let titleText;
            const textNodeText = 'test-text-node';
            cell.set('markup', [
                textNodeText,
                { tagName: 'rect', selector: 'body' },
                { tagName: 'text', selector: 'label' }
            ]);
            assert.equal(cellView.el.querySelectorAll('title').length, 0);
            titleText = 'test-title';
            cell.attr('root/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, textNodeText);
            assert.equal(cellView.el.firstElementChild.textContent, titleText);
            titleText = 'test-title-2';
            cell.attr('root/title', titleText);
            assert.equal(cellView.el.querySelectorAll('title').length, 1);
            assert.equal(cellView.el.firstChild.textContent, textNodeText);
            assert.equal(cellView.el.firstElementChild.textContent, titleText);
        });
    });
});

