import { sharedApplication } from './shared-application';

describe('sharedApplication', () => {
  it('should work', () => {
    expect(sharedApplication()).toEqual('shared-application');
  });
});
