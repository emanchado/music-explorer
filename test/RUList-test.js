import test from 'ava';
import RUList from '../lib/RUList';

test.beforeEach(t => {
    t.context.rul = new RUList();
    t.end();
});

test('Lists start with 0 items', t => {
    t.is(t.context.rul.length, 0);
    t.end();
});

test('Added items are available', t => {
    t.context.rul.add("foo");
    t.is(t.context.rul.length, 1);
    t.is(t.context.rul.get(0), "foo");
    t.end();
});

test('Newer items appear first', t => {
    t.context.rul.add("foo");
    t.context.rul.add("bar");
    t.is(t.context.rul.get(0), "bar");
    t.is(t.context.rul.get(1), "foo");
    t.end();
});

test('No duplicates', t => {
    t.context.rul.add("foo");
    t.context.rul.add("foo");
    t.is(t.context.rul.get(0), "foo");
    t.is(t.context.rul.length, 1);
    t.end();
});

test('Already-existing items get moved to the first position', t => {
    t.context.rul.add("foo");
    t.context.rul.add("bar");
    t.context.rul.add("foo");
    t.is(t.context.rul.get(0), "foo");
    t.is(t.context.rul.get(1), "bar");
    t.end();
});

test('There cannot be more than maxItems items', t => {
    let list = new RUList(3);
    list.add("one");
    list.add("two");
    list.add("three");
    list.add("four");
    t.is(list.get(0), "four");
    t.is(list.length, 3);
    t.end();
});

test('The default maxItems value is 5', t => {
    for (let i = 0; i < 6; i++) {
        t.context.rul.add("item " + i);
    }
    t.is(t.context.rul.get(0), "item 5");
    t.is(t.context.rul.length, 5);
    t.end();
});

test('Do not remove duplicate items before calculating limit', t => {
    t.context.rul.add("foo");
    t.context.rul.add("bar");
    t.context.rul.add("foo");
    t.is(t.context.rul.get(0), "foo");
    t.is(t.context.rul.get(1), "bar");
    t.end();
});

test('Do not truncate list before removing duplicates', t => {
    let list = new RUList(2);
    list.add("foo");
    list.add("bar");
    list.add("bar");
    t.is(list.get(0), "bar");
    t.is(list.get(1), "foo");
    t.is(list.length, 2);
    t.end();
});

test('Can export to an array', t => {
    t.context.rul.add("foo");
    t.context.rul.add("bar");
    t.context.rul.add("foo");
    t.same(t.context.rul.toArray(), ["foo", "bar"]);
    t.end();
});

test('The exported array is a copy', t => {
    t.context.rul.add("foo");
    let exportedArray = t.context.rul.toArray();
    exportedArray[0] = "other";
    t.same(t.context.rul.get(0), "foo");
    t.end();
});
