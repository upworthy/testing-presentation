import React from 'react';

/**
 * Testing!
 *
 * Let's imagine the following feature:
 *
 * <button>Like this post on Fakebook</button>
 *
 * When we click that button, we should:
 *   1. Send a LIKE request to Fakebook.
 *   2. If the request succeeds, we'll update application state to track
 *      this. Perhaps we'll use this state to display a thank-you
 *      message later.
 *
 * We'll do this in React and Redux, and learn about _how_ to
 * test as well as _what_ to test along the way.
 *
 * So let's get started! To begin with, we'll set up our Redux
 * store to track whether or not the user has liked this page yet.
 *
 * Because reducers are simple functions, we can test them in
 * isolation. We don't need to involve Redux at this stage.
 */

const LIKED_PAGE = "LIKED_PAGE";
const INIT_STATE = { liked: false };

const reducer = (state = INIT_STATE, action) => {
  switch (action.type) {
  case LIKED_PAGE: return { liked: true };
  default: return state;
  }
};

/**
 * Easy peasy. So how do we test this? We'll use Mocha to set up
 * our tests. Mocha provides the `describe` and `it` methods we
 * use to structure our tests.
 *
 * `describe` and `it` are injected by mocha, so we don't need
 * to import them.
 *
 * https://mochajs.org/
 */

/* global describe, it */

describe('A test', () => {
  /**
   * `describe` takes a label for your test block. It can be
   * whatever you want, but usually the name of your module
   * or component is a good choice.
   */
  describe('can be nested', () => {
    /**
     * You can nest `describe` blocks if it helps organize your tests.
     */
    it('will have some assertations', () => {
      /**
       * `it` also takes a label. It might be a description of the
       * expected behavior under test. These are often written in
       * BDD style: `it("should ...")`.
       */
    });
  });
});

/**
 * That test didn't make any assertations. We haven't talked about them yet.
 * Mocha doesn't ship with an assertation library, so you have to supply your
 * own. We use Chai, because it's similar to RSpec's BDD-style assertations.
 *
 * http://chaijs.com
 */

import { expect } from 'chai';

/**
 * Now we can test our reducer using `describe`, `it`, and `expect`.
 */
describe('reducer', () => {
  /**
   * Usually Redux fires off the init action for us.
   * For this test we'll have to pass something manually.
   * It doesn't really matter what we pass, we just want
   * to simulate instantiating a reducer with no existing state.
   */
  it('should initialize with liked = false', () => {
    const state = reducer(undefined, { type: "ANYTHING" });
    expect(state).to.eql({ liked: false });
  });

  /**
   * A single `describe` block often contains multiple assertations.
   * Here we test that our action works as expected. Now we've covered
   * all the branches of our reducer.
   */
  it('should set clicked = true', () => {
    const state = { liked: false };
    const newState = reducer(state, { type: LIKED_PAGE });
    expect(newState).to.eql({ liked: true });
  });
});

/**
 * That's a little more readable. From here on out we'll use Chai.
 * Let's think about our component now. We haven't talked about
 * what the Fakebook API looks like, so how about we start with what
 * we do know: clicking the button should update our state.
 *
 * But how do we test the behavior of React components?
 * Meet Enzyme. It's a project from AirBnB.
 *
 * http://airbnb.io/enzyme/
 */

import { shallow, mount } from 'enzyme';

/**
 * You'll probably use Enzyme's `shallow` method most often. It's
 * sort of like `React.createComponent`, in that it instantiates a
 * component and its backing vdom. But just like `React.createComponent`
 * needs a corresponding `ReactDOM.render()` to put the newly-created
 * component on the page, `shallow` doesn't actually mount the component
 * anywhere.
 *
 * If you need to actually mount the component (for instance, to verify
 * behavior related to `componentDidMount`) you can use `mount` instead.
 *
 * There's also a Chai plugin that adds Enzyme-specific matchers, so
 * let's go ahead and add that now.
 */

import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(chaiEnzyme());

/**
 * Now we can use `shallow` and chai-enzyme's `html` matcher to
 * test this component.
 */
const FBButton = () => <button>Like this post on Fakebook!</button>;

describe('<FBButton />', () => {
  it('renders a component', () => {
    const wrapper = shallow(<FBButton />);
    const html = "<button>Like this post on Fakebook!</button>";
    expect(wrapper).to.have.html(html);
  });
});

/**
 * Hmm. that's not a very useful test. For starters we're just testing that
 * React is doing its job. That's redundant. Second, if we ever updated the
 * wording on that button, our test would break.
 *
 * A more useful test would verify the behavior of the button. We know what
 * should happen when it's clicked, and we'd like to know if we accidentally
 * break that later.
 *
 * Let's start with something easy. Since we're using react-redux, it's safe to
 * assume we'll be using `connect()` to inject our click handler into this
 * component's props as a callback.
 *
 * If this was our component:
 */

const FBButton3 = ({ onClick }) =>
  <button onClick={onClick}>Like this post on Fakebook!</button>;

/**
 * ...we'd then map a callback into our component's props with `connect`.
 *
 *   const likePage = () => ({ type: LIKED_PAGE });
 *
 *   export default connect({ likePage })(FBButton);
 *
 * But in order to test our _connected_ component, we'd have to involve
 * react-redux in our test. It would be preferable isolate our component as
 * much as possible while testing. Think about it this way: All our basic
 * component knows is that it should accept an `onClick` prop and call it in
 * response to a click event. If a "dumb" component doesn't know or care what
 * its callbacks do, its tests don't need to care either.
 *
 * This separation makes it very easy to test dumb components. We can use
 * arbitrary functions to ensure our event handlers are firing.
 */

describe("<FBButton3 />", () => {
  it('calls this.props.onClick', () => {
    let clicked = false;
    const onClick = () => clicked = true;
    const wrapper = shallow(<FBButton3 onClick={onClick} />);

    wrapper.find('button').simulate('click');
    expect(clicked).to.be.true;
  });
});

/**
 * That's one way to do it, and there's nothing wrong with taking the simple
 * route. But let's talk about a more powerful testing tool: Test Doubles.
 *
 * A test double is like a stunt double for your code. It replaces an existing
 * method and records any calls to that method, so you can assert later that
 * your code was called when expected and with the arguments you expected.
 *
 * Sinon is our test double library: http://sinonjs.org/
 *
 * And yes, there's a Chai plugin for Sinon. So let's import that as well.
 */

import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe("<FBButton3 /> with a test double", () => {
  it('calls this.props.onClick', () => {
    /**
     * stub() creates a test double. With no args, it will
     * just return a double that records calls and arguments.
     */
    const onClick = stub();
    const wrapper = shallow(<FBButton3 onClick={onClick} />);

    wrapper.find('button').simulate('click');
    /**
     * We can then ask our double if it was ever called!
     */
    expect(onClick).to.have.been.called;
  });
});

/**
 * There's a lot more we can do with test doubles, as we'll see.
 * But let's take a step back and imagine our Fakebook API works
 * as follows:
 *
 *   1. We import the Fakebook module as `FB`.
 *   2. We can call `FB.like()` to send a `like` event to the remote
 *      Fakebook API.
 *   3. `FB.like()` returns true or false depending on whether that request
 *      succeeded.
 *
 * There are a number of complications here. First, `FB.like` hits an external
 * endpoint. Our tests definitely shouldn't be making AJAX calls to 3rd-party
 * servers.
 *
 * Second, our application depends on the response from `FB.like()`. We don't
 * want to update state incorrectly if the request fails! But if we also
 * can't make remote calls, how do we replicate the response behavior that the
 * rest of our app still depends on?
 *
 * Test doubles to the rescue.
 *
 * In addition to a bare `stub()`, we can stub an existing method. In this
 * case, we want to stub out `FB.like()` so that our tests don't talk to FB
 * at all.
 */

import FB from './fakebook';

/**
 * With `FB.like()` stubbed out, it's safe to simulate a click in this next
 * test. No AJAX call will be performed.
 *
 */
describe('<FBButton3 /> with a stubbed dependency', () => {
  it("calls our test double of the original FB.like()", () => {
    /**
     * `stub()` takes an object, and the name of the method to replace.
     */
    stub(FB, 'like');
    const wrapper = shallow(<FBButton3 onClick={FB.like} />);

    wrapper.find('button').simulate('click');
    /**
     * Even though the "real" FB.like wasn't called, we can still assert
     * that its stub was.
     */
    expect(FB.like).to.have.been.called;
    /**
     * Important! when you're stubbing an existing method, ALWAYS restore it
     * at the end of each test.
     */
    FB.like.restore();
  });
});

/**
 * We're almost there! Now we just need to wrap our `likePage` action in a
 * conditional. Remember, we want to make sure `FB.like()` succeeds first
 * before we update our app state.
 *
 * Again, because we're using react-redux, we can assume that our action
 * creator will be passed in as a callback:
 *
 *   connect({ likePage })(FBButton);
 *
 * And just like last time, this means we can pass an arbitrary function to
 * the un-connected version of this component instead of relying on Redux.
 */

const FBButton4 = ({ likePage }) => {
  const onClick = () => {
    if (FB.like()) {
      likePage();
    }
  };
  return <button onClick={onClick}>Like this on Fakebook!</button>;
};

describe('<FBButton4 />', () => {
  it('will call our action because FB.like returns `true`', () => {
    /**
     * Here we'll use both a bare stub _and_ stub an existing method. The
     * first stub lets us assert on the behavior that we expect: namely, our
     * `likePage` action creator gets called.
     */
    const likePage = stub();
    /**
     * The second double stubs out unwanted side effects: FB.like() shouldn't
     * be hitting the network while we're testing.
     */
    stub(FB, 'like').returns(true);

    const wrapper = shallow(<FBButton4 likePage={likePage} />);
    wrapper.find('button').simulate('click');

    expect(likePage).to.have.been.called;
    FB.like.restore(); // Remember what I said about restoring doubles!
  });

  it("won't update state if `FB.like()` returns false", () => {
    /**
     * This time we'll stub `FB.like()` to return false and assert that
     * our action creator was _not_ called.
     */
    const likePage = stub();
    stub(FB, 'like').returns(false);

    const wrapper = shallow(<FBButton4 likePage={likePage} />);
    wrapper.find('button').simulate('click');

    expect(likePage).not.to.have.been.called;
    FB.like.restore(); // Seriously! Forgetting this will mess you up.
  });
});

/**
 * One thing to note is that at no point during our tests did we import Redux
 * or React-Redux. However, we've fully tested our reducer and our components.
 * That's great! It means our state (model) and our components (views) are
 * well decoupled from Redux, or whatever the C might be in our MVC
 * architecture. The best piece of advice I can give you is this: if you're
 * having trouble writing a test, think about changing your code to make it
 * easier to test instead of making your test more complicated. Decoupling our
 * components from app state and passing in generic callbacks definitely makes
 * testing easier, because our components end up with far fewer dependencies.
 *
 * We've barely scratched the surface with test doubles. Doubles are pretty
 * powerful and you can assert on all sorts of things: which arguments were
 * passed; how many times a double was called; you can even create a double
 * that calls through the original method instead of replacing it outright.
 *
 * Likewise, Chai and its plugins make it easy to write concise tests and
 * make all kinds of assertations: whether a string matches a regexp, a number
 * is within range, or if a React component contains specific child nodes, to
 * name just a few examples. You'll have to read the docs to find out more!
 *
 * One last thing: if you run `npm start` you can visit http://localhost:8080
 * to see all the tests in this file actually pass in the browser. Try out
 * some other doubles and matchers!
 *
 * Happy testing! 🗿 🍹
 */
