import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query CurrentUser {
    user {
      id
      email
      platformRole
    }
  }
`;

export const GET_ADMIN_REVENUE_OVERVIEW = gql`
  query AdminRevenueOverview {
    adminRevenueOverview {
      activeAccounts
      trialAccounts
      pastDueAccounts
      monthlyRevenue {
        month
        total
        chargeCount
      }
    }
  }
`;

const WORKSPACE_SUMMARY_FIELDS = gql`
  fragment WorkspaceSummaryFields on AdminWorkspaceSummary {
    id
    name
    ownerId
    ownerEmail
    createdAt
    plan
    billingStatus
    memberCount
    connectionCount
    activeConnectionCount
  }
`;

export const GET_ADMIN_WORKSPACES = gql`
  query AdminWorkspaces($search: String, $limit: Int, $offset: Int) {
    adminWorkspaces(search: $search, limit: $limit, offset: $offset) {
      total
      rows {
        ...WorkspaceSummaryFields
      }
    }
  }
  ${WORKSPACE_SUMMARY_FIELDS}
`;

export const GET_ADMIN_WORKSPACE = gql`
  query AdminWorkspace($id: Int!) {
    adminWorkspace(id: $id) {
      workspace {
        ...WorkspaceSummaryFields
      }
      charges {
        id
        kind
        status
        periodStart
        periodEnd
        fixedAmount
        usageFee
        adSpend
        totalAmount
        currency
        description
        failureReason
        attempt
        chargedAt
      }
      connections {
        id
        orgId
        orgName
        status
        apiVersion
        currency
        timeZone
        lastSyncedAt
        lastError
      }
    }
  }
  ${WORKSPACE_SUMMARY_FIELDS}
`;

export const GET_ADMIN_TASKS = gql`
  query AdminTasks($state: String, $search: String, $limit: Int, $offset: Int) {
    adminTasks(state: $state, search: $search, limit: $limit, offset: $offset) {
      total
      rows {
        id
        workspaceId
        workspaceName
        kind
        state
        changeSource
        description
        done
        total
        error
        failureCount
        cancelRequested
        heartbeatAt
        createdAt
        startedAt
        finishedAt
      }
    }
  }
`;

export const GET_ADMIN_SYNC_STATES = gql`
  query AdminSyncStates {
    adminSyncStates {
      connectionId
      workspaceId
      workspaceName
      orgName
      connectionStatus
      dailySyncedThrough
      hourlySyncedThrough
      lastRunAt
      lastError
      lastKeywordCount
    }
  }
`;

export const GET_ADMIN_ACTIVITY = gql`
  query AdminActivity($workspaceId: Int, $limit: Int, $offset: Int) {
    adminActivity(workspaceId: $workspaceId, limit: $limit, offset: $offset) {
      total
      rows {
        id
        workspaceId
        workspaceName
        userEmail
        actor
        entityType
        action
        changeSource
        status
        okCount
        failedCount
        createdAt
      }
    }
  }
`;

export const GET_ADMIN_USERS = gql`
  query AdminUsers($search: String, $limit: Int, $offset: Int) {
    adminUsers(search: $search, limit: $limit, offset: $offset) {
      total
      rows {
        id
        email
        name
        platformRole
        createdAt
        ownedWorkspaceCount
        memberWorkspaceCount
      }
    }
  }
`;

export const GET_ADMIN_BILLING_ACCOUNTS = gql`
  query AdminBillingAccounts($status: String, $limit: Int, $offset: Int) {
    adminBillingAccounts(status: $status, limit: $limit, offset: $offset) {
      total
      rows {
        id
        workspaceId
        workspaceName
        ownerEmail
        plan
        status
        pendingPlan
        dodoStatus
        cardBrand
        cardLast4
        cardExpMonth
        cardExpYear
        currentPeriodEnd
        trialEndsAt
        cancelAtPeriodEnd
        lifetimeRevenue
        failedChargeCount
      }
    }
  }
`;

export const GET_ADMIN_RAMP_UPS = gql`
  query AdminRampUps($status: String, $limit: Int, $offset: Int) {
    adminRampUps(status: $status, limit: $limit, offset: $offset) {
      total
      rows {
        id
        workspaceId
        workspaceName
        appName
        adamId
        status
        goal
        targetCpi
        targetRoas
        dailyBudget
        countries
        campaignCount
        lastHarvestAt
        lastOptimizeAt
        stoppedAt
        createdAt
      }
    }
  }
`;

export const GET_ADMIN_ASA_CONNECTIONS = gql`
  query AdminAsaConnections($status: String, $search: String, $limit: Int, $offset: Int) {
    adminAsaConnections(status: $status, search: $search, limit: $limit, offset: $offset) {
      total
      rows {
        id
        workspaceId
        workspaceName
        ownerEmail
        orgId
        orgName
        status
        apiVersion
        currency
        timeZone
        lastSyncedAt
        lastError
        createdAt
      }
    }
  }
`;

export const GET_ADMIN_ASA_CONNECTION = gql`
  query AdminAsaConnection($id: String!) {
    adminAsaConnection(id: $id) {
      id
      workspaceId
      workspaceName
      ownerEmail
      orgId
      orgName
      adAccountId
      status
      apiVersion
      currency
      timeZone
      paymentModel
      roleNames
      basicDetectedAt
      lastSyncedAt
      lastError
      createdAt
      updatedAt
      dailySyncedThrough
      hourlySyncedThrough
      lastRunAt
      lastKeywordCount
      counts {
        apps
        rules
        rampUps
        tasks
        budgetOrders
        customReports
        activityEntries
      }
      apps {
        adamId
        title
        store
        country
        icon
      }
      rampUps {
        id
        appName
        status
        goal
        dailyBudget
        countries
        createdAt
      }
      tasks {
        id
        kind
        state
        description
        done
        total
        createdAt
      }
    }
  }
`;

export const GET_ADMIN_TASK = gql`
  query AdminTask($id: String!) {
    adminTask(id: $id) {
      id
      workspaceId
      workspaceName
      connectionId
      orgName
      kind
      changeSource
      description
      state
      done
      total
      error
      cancelRequested
      actorEmail
      heartbeatAt
      createdAt
      startedAt
      finishedAt
    }
  }
`;
