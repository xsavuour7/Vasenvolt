'use strict';

var assert = require('assert');
var Hook = require('../lib/hook.js');

function A() {
    this.val = 0;
}
A.prototype.save = function() {
    this.val = -this.val;
};

Hook.extend(A.prototype);

describe('Hook API basic test', function() {
    it('Hook a non-object obj, return false', function() {
        assert.ifError(Hook.extend(null));
        assert.ifError(Hook.extend(undefined));
    });

    it('no `pre`/`posts` invoked', function() {
        var a = new A();
        a.val = 3;
        a.save();

        assert.equal(a.val, -3);
    });
});

describe('Hook API `pre` test', function() {
    it('only one `pre` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        });
        a.save();

        assert.equal(a.val, -1);
    });

    it('multi `pre` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        });

        a.pre('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, -3);
    });

    it('chain `pre` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        }).pre('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, -3);
    });

    it('multi `pre` invoked, the later ones would not excuted if former return `true`', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
            return true;
        });

        a.pre('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, -1);
    });
});

describe('Hook API `post` test', function() {
    it('only one `post` invoked', function() {
        var a = new A();
        a.post('save', function() {
            this.val += 1;
        });
        a.save();
        assert.equal(a.val, 1);
    });

    it('multi `post` invoked', function() {
        var a = new A();
        a.post('save', function() {
            this.val += 1;
        });

        a.post('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, 3);
    });

    it('chain `post` invoked', function() {
        var a = new A();
        a.post('save', function() {
            this.val += 1;
        }).post('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, 3);
    });

    it('multi `post` invoked, the later ones would not excuted if former return `true`', function() {
        var a = new A();
        a.post('save', function() {
            this.val += 1;
            return true;
        });

        a.post('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, 1);
    });
});


describe('Hook API `pre`/`post` mixed test', function() {
    it('only one `pre`&`post` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        });
        a.post('save', function() {
            this.val += 1;
        });
        a.save();
        assert.equal(a.val, 0);
    });

    it('chain `pre`&`post` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        }).post('save', function() {
            this.val += 1;
        });
        a.save();
        assert.equal(a.val, 0);
    });

    it('multi `pre`&`post` invoked', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
        });
        a.post('save', function() {
            this.val += 1;
        });
        a.pre('save', function() {
            this.val += 2;
        });
        a.post('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, 0);
    });

    it('multi `pre`&`post` invoked, the later ones would not excuted if former return `true`', function() {
        var a = new A();
        a.pre('save', function() {
            this.val += 1;
            return true;
        });
        a.post('save', function() {
            this.val += 1;
        });
        a.pre('save', function() {
            this.val += 2;
        });
        a.post('save', function() {
            this.val += 2;
        });
        a.save();

        assert.equal(a.val, 2);
    });
});
