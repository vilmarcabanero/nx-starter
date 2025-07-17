import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Settings, User, Bell } from 'lucide-react';

describe('Tabs Component Snapshots', () => {
  describe('Tabs root', () => {
    it('renders basic tabs container', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tabs with custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('TabsList', () => {
    it('renders basic tabs list', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tabs list with custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('TabsTrigger', () => {
    it('renders basic tab trigger', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tab trigger with custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Custom Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled tab trigger', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled>
              Disabled Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tab trigger with icon', () => {
      const { container } = render(
        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">
              <Settings />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('TabsContent', () => {
    it('renders basic tab content', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">
            <p>This is tab content.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tab content with custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" className="custom-content">
            <p>Custom tab content.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('complete tabs examples', () => {
    it('renders simple two-tab example', () => {
      const { container } = render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p>Make changes to your account here.</p>
          </TabsContent>
          <TabsContent value="password">
            <p>Change your password here.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tabs with icons and mixed content', () => {
      const { container } = render(
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <User />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <h3>Profile Settings</h3>
            <p>Manage your profile information.</p>
          </TabsContent>
          <TabsContent value="notifications">
            <h3>Notification Preferences</h3>
            <p>Configure your notification settings.</p>
          </TabsContent>
          <TabsContent value="settings">
            <h3>General Settings</h3>
            <p>Adjust your application preferences.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tabs with disabled tab', () => {
      const { container } = render(
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
            <TabsTrigger value="another">Another</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <p>This tab is available.</p>
          </TabsContent>
          <TabsContent value="disabled">
            <p>This content won't be accessible.</p>
          </TabsContent>
          <TabsContent value="another">
            <p>Another available tab.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tabs with custom styling', () => {
      const { container } = render(
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom" className="text-blue-600">
              Custom Tab 1
            </TabsTrigger>
            <TabsTrigger value="styled" className="text-green-600">
              Custom Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="custom" className="mt-4 p-4 border rounded">
            <p>Custom styled content area.</p>
          </TabsContent>
          <TabsContent value="styled" className="mt-4 p-4 border rounded">
            <p>Another styled content area.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('renders tabs with aria attributes', () => {
      const { container } = render(
        <Tabs defaultValue="accessible" aria-label="Example tabs">
          <TabsList role="tablist">
            <TabsTrigger value="accessible" aria-controls="accessible-content">
              Accessible Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="accessible"
            id="accessible-content"
            role="tabpanel"
          >
            <p>Accessible content with proper ARIA attributes.</p>
          </TabsContent>
        </Tabs>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
