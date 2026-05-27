# hook.js
Add `pre` or `post` hooks to your methods.

# Install
```
npm install hook.js
```

# How to use
```
var Hook = require('hook.js');
```

You can add hook feature to a CLASS:
```
function YourClass() {}
YourClass.prototype.func = function() {
    console.log('inner log');
};

// add hook feature
Hook.extend(YourClass.prototype);
```

Then you can hook `func` to a instance of `YourClass`:
```
var obj = new YourClass();

obj.pre('func', function() {
    console.log('pre log'); 
});

obj.post('func', function() {
    console.log('post log');
});
```

Now, `func` would print:
```
pre log
inner log
post log
```

# Chaining & Cancellation
When add multi `pre`/`post`, normally we will do:
```
obj.pre(f1);
obj.pre(f2);
```
However, we can also write in a fast & beautiful way:
```
obj.pre(f1).pre(f2);
```


If you donot want invoke `f2` for whatever reason, just return `true` in `f1`:
```
function f1() {
    if (your_condition) {
        // all later added `pre`s will not invoked
        return true;
    }
    // do your stuff
}
```

# Contact
`Email` : `isaymeorg@gmail.com`
