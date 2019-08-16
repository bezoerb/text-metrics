describe('TextMetrics', function() {
  it('is available', function() {
    expect(textMetrics).toBeDefined();
    expect(textMetrics.init).toBeDefined();
    expect(textMetrics.utils).toBeDefined();
  });

  it('has instance all methods', function() {
    var instance = textMetrics.init();
    expect(instance.width).toBeDefined();
    expect(instance.height).toBeDefined();
    expect(instance.maxFontSize).toBeDefined();
    expect(instance.lines).toBeDefined();
  });

  it('does not break without element', function() {
    const instance = textMetrics.init();

    expect(instance.lines()).toEqual([]);
    expect(instance.maxFontSize()).toBe(undefined);
    expect(instance.width()).toBe(0);
    expect(instance.height()).toBe(0);
  });

  it('Computes width without element', function() {
    var expected = textMetrics.utils.getContext2d('400 30px Helvetica, Arial, sans-serif').measureText('test');
    var instance = textMetrics.init({
      'font-size': '30px',
      'font-weight': '400',
      'font-family': 'Helvetica, Arial, sans-serif',
    });

    var val = instance.width('test');

    expect(val).toBe(expected.width);
  });

  it('computes lines correctly', function() {
    var expected = [
      'Lorem ipsum dolor sit amet, con-',
      'sectur adipisicing elit. Aliquam',
      'atque cum dolor explicabo ★.',
    ];
    var el = document.querySelector('[data-test="1"]');
    var instance = textMetrics.init(el);

    var lines = instance.lines();
    expect(lines.length).toBe(expected.length);
    for (var i = 0; i < lines.length; i++) {
      expect(lines[i]).toBe(expected[i]);
    }
  });

  it('computes lines with text overwrite', function() {
    var el = document.querySelector('[data-test="1"]');
    var instance = textMetrics.init(el);

    var lines = instance.lines('test');
    expect(lines.length).toBe(1);
    expect(lines[0]).toEqual('test');
  });

  it('computes max font-size', function() {
    var el1 = document.querySelector('[data-test="2"]');
    var el2 = document.querySelector('[data-test="3"]');
    var max1 = textMetrics.init(el1).maxFontSize();
    var max2 = textMetrics.init(el2).maxFontSize();

    expect(max1).toEqual('49px');
    expect(max2).toEqual('56px');
  });

  it('computes width', function() {
    var threshold = 4;
    var el1 = document.querySelector('[data-test="4"]');
    var el2 = document.querySelector('[data-test="5"]');
    var w1 = textMetrics.init(el1).width();
    var w2 = textMetrics.init(el2).width();

    expect(w1 < w2).toBeTruthy();
    expect(Math.ceil(w1)).toBeGreaterThanOrEqual(el1.offsetWidth - threshold);
    expect(Math.ceil(w2)).toBeGreaterThanOrEqual(el2.offsetWidth - threshold);
    var r1 = Math.abs(Math.ceil(w1) - Math.ceil(el1.offsetWidth));
    var r2 = Math.abs(Math.ceil(w2) - Math.ceil(el2.offsetWidth));

    expect(r1).toBeLessThanOrEqual(threshold);
    expect(r2).toBeLessThanOrEqual(threshold);
  });

  it('computes height', function() {
    var el1 = document.querySelector('[data-test="6"]');
    var el2 = document.querySelector('[data-test="7"]');

    var w1 = textMetrics.init(el1).height();
    var w2 = textMetrics.init(el2).height();
    expect(Math.ceil(w1)).toBeGreaterThanOrEqual(el1.offsetHeight);
    expect(Math.ceil(w2)).toBeGreaterThanOrEqual(el2.offsetHeight);
    var r1 = Math.abs(Math.ceil(w1) - Math.ceil(el1.offsetHeight));
    var r2 = Math.abs(Math.ceil(w2) - Math.ceil(el2.offsetHeight));
    expect(r1).toBeLessThanOrEqual(2);
    expect(r2).toBeLessThanOrEqual(2);
  });
});
