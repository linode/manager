import React from 'react';

export const NewDetailTemplateD = () => {
  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        backgroundColor: '#f9f9fb',
        padding: '20px',
        margin: 0,
        maxWidth: '900px',
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          color: '#333',
          marginBottom: '20px',
          fontWeight: 500,
        }}
      >
        Left-Aligned Titles (Alternative)
      </h1>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Summary Row */}
        <tr>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '40px',
              color: '#3683dc',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '150px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#555',
              position: 'relative',
            }}
          >
            SUMMARY
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-1px',
                left: '0',
                right: '0',
                height: '1px',
                backgroundColor: '#f0f0f0',
                opacity: '0.7',
              }}
            ></div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Status
                </div>
                <div style={{ fontSize: '14px', color: '#4caf50' }}>
                  Running
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  CPU Core
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>1</div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  RAM
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>2 GB</div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Volumes
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>0</div>
              </div>
            </div>
          </td>
        </tr>

        {/* Instance Details Row */}
        <tr>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '40px',
              color: '#3683dc',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '150px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#555',
              position: 'relative',
            }}
          >
            INSTANCE DETAILS
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-1px',
                left: '0',
                right: '0',
                height: '1px',
                backgroundColor: '#f0f0f0',
                opacity: '0.7',
              }}
            ></div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Linode ID
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>44557799</div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Created
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  2025-05-20 23:30
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Region
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  Washington, DC
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Plan
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  Dedicated 4 GB
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Encryption
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6c5ce7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      display: 'inline-block',
                      verticalAlign: '-2px',
                      marginRight: '4px',
                    }}
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Encrypted
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* VPC Info Row */}
        <tr>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '40px',
              color: '#3683dc',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
              </svg>
            </div>
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '150px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#555',
              position: 'relative',
            }}
          >
            VPC INFO
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-1px',
                left: '0',
                right: '0',
                height: '1px',
                backgroundColor: '#f0f0f0',
                opacity: '0.7',
              }}
            ></div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  VPC Label
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  VPC-01-East
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  Subnets
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>fe-group</div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  VPC IPv4
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>10.0.4.1</div>
              </div>
            </div>
          </td>
        </tr>

        {/* LKE Cluster Row */}
        <tr>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '40px',
              color: '#3683dc',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              width: '150px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#555',
            }}
          >
            LKE CLUSTER
          </td>
          <td
            style={{
              padding: '16px',
              verticalAlign: 'top',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-1px',
                left: '0',
                right: '0',
                height: '1px',
                backgroundColor: '#f0f0f0',
                opacity: '0.7',
              }}
            ></div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  LKE Cluster
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  Dongo (175094)
                </div>
              </div>
              <div
                style={{
                  marginRight: '40px',
                  minWidth: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '4px',
                  }}
                >
                  LKE Cluster
                </div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  Dongo (175094)
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  );
};
